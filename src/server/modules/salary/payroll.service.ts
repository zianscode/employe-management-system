import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { isAdminRole } from "@/shared/constants/roles";
import { SalaryRecord } from "@/shared/types/salary.types";
import { countWorkingDays, monthRange } from "@/shared/utils/date";

function assertPeriod(month: number, year: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("Bulan tidak valid");
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Tahun tidak valid");
}

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
      deduction: s.deductions + s.unpaidLeaveCut,
      totalSalary: s.totalNet,
      status: s.isPaid ? "Dibayar" : "Pending",
      period: `${String(s.periodMonth).padStart(2, "0")}/${s.periodYear}`,
    }));
  }

  private async calculate(employeeId: string, basicSalary: number, month: number, year: number) {
    const setting = await companySettingService.get();
    const { start, end } = monthRange(month, year);

    const overtime = await prisma.attendance.aggregate({
      where: { employeeId, date: { gte: start, lte: end }, isOvertime: true },
      _sum: { overtimeHours: true },
    });
    const overtimePay = Math.round((overtime._sum.overtimeHours || 0) * setting.overtimeRatePerHour);

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
      (sum, l) => sum + countWorkingDays(l.startDate > start ? l.startDate : start, l.endDate < end ? l.endDate : end),
      0
    );
    const unpaidLeaveCut = Math.round((basicSalary / setting.workingDaysPerMonth) * unpaidDays);

    return { overtimePay, unpaidLeaveCut };
  }

  async generateMonthly(month: number, year: number) {
    assertPeriod(month, year);
    const employees = await prisma.employee.findMany({
      where: { status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] } },
      select: { id: true, salaryBase: true },
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

      const basicSalary = emp.salaryBase;
      const allowances = existing?.allowances ?? 0;
      const deductions = existing?.deductions ?? 0;
      const { overtimePay, unpaidLeaveCut } = await this.calculate(emp.id, basicSalary, month, year);
      const totalGross = basicSalary + allowances + overtimePay;
      const totalNet = Math.max(0, totalGross - deductions - unpaidLeaveCut);

      await prisma.salary.upsert({
        where: key,
        update: { basicSalary, overtimePay, unpaidLeaveCut, totalGross, totalNet },
        create: {
          employeeId: emp.id,
          periodMonth: month,
          periodYear: year,
          basicSalary,
          allowances,
          deductions,
          overtimePay,
          unpaidLeaveCut,
          totalGross,
          totalNet,
        },
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
}

export const payrollService = new PayrollService();
