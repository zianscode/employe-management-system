import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, LeaveStatus, LeaveType, PayrollComponentType, Prisma, PtkpStatus } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { holidayService } from "@/server/modules/settings/holiday.service";
import { isAdminRole } from "@/shared/constants/roles";
import { SalaryRecord, SalarySlip, SlipLine } from "@/shared/types/salary.types";
import { countWorkingDays, monthRange, formatPeriod } from "@/shared/utils/date";
import { PTKP_LABELS } from "@/shared/constants/payroll";
import { annualPph21, calculateBpjs, monthlyTerPph21 } from "./payroll.rules";

const LAST_TAX_PERIOD = 12;

interface ComponentSnapshot {
  name: string;
  type: PayrollComponentType;
  amount: number;
}

function assertPeriod(month: number, year: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("Bulan tidak valid");
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Tahun tidak valid");
}

const periodLabel = formatPeriod;

const employeeBpjs = (s: { bpjsKesEmployee: number; jhtEmployee: number; jpEmployee: number }) =>
  s.bpjsKesEmployee + s.jhtEmployee + s.jpEmployee;

class PayrollService {
  private scopeFor(user: CurrentUser): Prisma.SalaryWhereInput {
    if (isAdminRole(user.role)) return {};
    return { employeeId: user.employeeId ?? "__none__" };
  }

  async list(user: CurrentUser, month: number, year: number): Promise<SalaryRecord[]> {
    assertPeriod(month, year);
    const salaries = await prisma.salary.findMany({
      where: { AND: [this.scopeFor(user), { periodMonth: month, periodYear: year }] },
      include: { employee: { include: { position: true } } },
      orderBy: { employee: { name: "asc" } },
    });

    return salaries.map((s) => ({
      id: s.id,
      nip: s.employee.nip || "-",
      name: s.employee.name,
      position: s.employee.position?.name || "-",
      basicSalary: s.basicSalary,
      allowance: s.allowances,
      overtimePay: s.overtimePay,
      bpjsEmployee: employeeBpjs(s),
      pph21: s.pph21,
      deduction: s.deductions + s.unpaidLeaveCut,
      totalSalary: s.totalNet,
      status: s.isPaid ? "Dibayar" : "Pending",
      period: `${String(s.periodMonth).padStart(2, "0")}/${s.periodYear}`,
    }));
  }

  async getSlip(user: CurrentUser, salaryId: string): Promise<SalarySlip> {
    const salary = await prisma.salary.findFirst({
      where: { AND: [this.scopeFor(user), { id: salaryId }] },
      include: { employee: { include: { position: true, department: true } } },
    });
    if (!salary) throw new Error("Slip gaji tidak ditemukan");
    const setting = await companySettingService.get();

    const components = (salary.components as ComponentSnapshot[] | null) ?? [];
    const allowanceLines = components.filter((c) => c.type === "ALLOWANCE").map((c) => ({ label: c.name, amount: c.amount }));
    const deductionLines = components.filter((c) => c.type === "DEDUCTION").map((c) => ({ label: c.name, amount: c.amount }));
    const nonZero = (lines: SlipLine[]) => lines.filter((l) => l.amount !== 0);

    const earnings = nonZero([
      { label: "Gaji Pokok", amount: salary.basicSalary },
      ...allowanceLines,
      { label: "Lembur", amount: salary.overtimePay },
    ]);
    const deductions = nonZero([
      { label: "BPJS Kesehatan (1%)", amount: salary.bpjsKesEmployee },
      { label: "BPJS JHT (2%)", amount: salary.jhtEmployee },
      { label: "BPJS JP (1%)", amount: salary.jpEmployee },
      { label: "PPh 21", amount: salary.pph21 },
      { label: "Potongan Cuti Diluar Tanggungan", amount: salary.unpaidLeaveCut },
      ...deductionLines,
    ]);
    const employerContributions = nonZero([
      { label: "BPJS Kesehatan (4%)", amount: salary.bpjsKesEmployer },
      { label: "BPJS JHT (3,7%)", amount: salary.jhtEmployer },
      { label: "BPJS JP (2%)", amount: salary.jpEmployer },
      { label: "BPJS JKK", amount: salary.jkkEmployer },
      { label: "BPJS JKM (0,3%)", amount: salary.jkmEmployer },
    ]);
    const sum = (lines: SlipLine[]) => lines.reduce((acc, l) => acc + l.amount, 0);

    return {
      id: salary.id,
      companyName: setting.companyName,
      companyNpwp: setting.npwp,
      periodLabel: periodLabel(salary.periodMonth, salary.periodYear),
      employee: {
        name: salary.employee.name,
        nip: salary.employee.nip || "-",
        position: salary.employee.position?.name || "-",
        department: salary.employee.department?.name || "-",
        ptkp: PTKP_LABELS[salary.ptkpStatus ?? salary.employee.ptkpStatus],
        npwp: salary.employee.npwpNumber,
      },
      earnings,
      deductions,
      employerContributions,
      totalEarnings: sum(earnings),
      totalDeductions: sum(deductions),
      netPay: salary.totalNet,
      taxableIncome: salary.taxableIncome,
      pph21Method: salary.pph21Method,
      status: salary.isPaid ? "Dibayar" : "Pending",
      paidAt: salary.paidAt ? salary.paidAt.toLocaleDateString("id-ID") : null,
    };
  }

  private async attendanceBasedAmounts(employeeId: string, basicSalary: number, month: number, year: number) {
    const setting = await companySettingService.get();
    const { start, end } = monthRange(month, year);

    const overtime = await prisma.attendance.aggregate({
      where: { employeeId, date: { gte: start, lte: end }, isOvertime: true },
      _sum: { overtimeHours: true },
    });
    const overtimePay = Math.round((overtime._sum.overtimeHours || 0) * setting.overtimeRatePerHour);

    const holidays = await holidayService.keysBetween(start, end);
    const unpaidLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        type: LeaveType.UNPAID,
        status: LeaveStatus.HR_APPROVED,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { startDate: true, endDate: true },
    });
    const unpaidDays = unpaidLeaves.reduce(
      (sum, l) => sum + countWorkingDays(l.startDate > start ? l.startDate : start, l.endDate < end ? l.endDate : end, holidays),
      0
    );
    const unpaidLeaveCut = Math.round((basicSalary / setting.workingDaysPerMonth) * unpaidDays);

    return { overtimePay, unpaidLeaveCut };
  }

  private async pph21For(
    employeeId: string,
    ptkp: PtkpStatus,
    month: number,
    year: number,
    taxableIncome: number,
    pensionContribution: number
  ) {
    if (month !== LAST_TAX_PERIOD) return monthlyTerPph21(ptkp, taxableIncome);

    const previous = await prisma.salary.aggregate({
      where: { employeeId, periodYear: year, periodMonth: { lt: month } },
      _sum: { taxableIncome: true, pph21: true, jhtEmployee: true, jpEmployee: true },
      _count: true,
    });

    return annualPph21({
      ptkp,
      annualGross: (previous._sum.taxableIncome || 0) + taxableIncome,
      annualPensionContribution: (previous._sum.jhtEmployee || 0) + (previous._sum.jpEmployee || 0) + pensionContribution,
      monthsWorked: previous._count + 1,
      pph21AlreadyWithheld: previous._sum.pph21 || 0,
    });
  }

  async generateMonthly(month: number, year: number) {
    assertPeriod(month, year);
    const setting = await companySettingService.get();
    const employees = await prisma.employee.findMany({
      where: { status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] } },
      include: { payrollComponents: true },
    });

    let processed = 0;
    let skippedPaid = 0;

    for (const emp of employees) {
      const key = { employeeId_periodMonth_periodYear: { employeeId: emp.id, periodMonth: month, periodYear: year } };
      const existing = await prisma.salary.findUnique({ where: key });
      if (existing?.isPaid) {
        skippedPaid++;
        continue;
      }

      const components: ComponentSnapshot[] = emp.payrollComponents.map((c) => ({ name: c.name, type: c.type, amount: c.amount }));
      const sumOf = (type: PayrollComponentType) => components.filter((c) => c.type === type).reduce((acc, c) => acc + c.amount, 0);

      const basicSalary = emp.salaryBase;
      const allowances = sumOf(PayrollComponentType.ALLOWANCE);
      const deductions = sumOf(PayrollComponentType.DEDUCTION);
      const { overtimePay, unpaidLeaveCut } = await this.attendanceBasedAmounts(emp.id, basicSalary, month, year);

      const bpjs = calculateBpjs(basicSalary + allowances, setting, {
        kesehatan: emp.bpjsKesehatan,
        ketenagakerjaan: emp.bpjsKetenagakerjaan,
      });

      const taxableIncome =
        basicSalary + allowances + overtimePay - unpaidLeaveCut + bpjs.jkkEmployer + bpjs.jkmEmployer + bpjs.bpjsKesEmployer;
      const pph21 = await this.pph21For(emp.id, emp.ptkpStatus, month, year, taxableIncome, bpjs.jhtEmployee + bpjs.jpEmployee);

      const totalGross = basicSalary + allowances + overtimePay;
      const totalNet = totalGross - unpaidLeaveCut - deductions - employeeBpjs(bpjs) - pph21.amount;

      const data = {
        basicSalary,
        allowances,
        deductions,
        overtimePay,
        unpaidLeaveCut,
        ...bpjs,
        ptkpStatus: emp.ptkpStatus,
        taxableIncome,
        pph21: pph21.amount,
        pph21Method: pph21.method,
        components: components as unknown as Prisma.InputJsonValue,
        totalGross,
        totalNet,
      };

      await prisma.salary.upsert({
        where: key,
        update: data,
        create: { employeeId: emp.id, periodMonth: month, periodYear: year, ...data },
      });
      processed++;
    }

    return { processed, skippedPaid };
  }

  async markAsPaid(salaryId: string) {
    const salary = await prisma.salary.findUnique({ where: { id: salaryId } });
    if (!salary) throw new Error("Slip gaji tidak ditemukan");
    if (salary.isPaid) throw new Error("Slip gaji sudah dibayar");
    return prisma.salary.update({ where: { id: salaryId }, data: { isPaid: true, paidAt: new Date() } });
  }

  async markPeriodAsPaid(month: number, year: number) {
    const result = await prisma.salary.updateMany({
      where: { periodMonth: month, periodYear: year, isPaid: false },
      data: { isPaid: true, paidAt: new Date() },
    });
    return result.count;
  }
}

export const payrollService = new PayrollService();
