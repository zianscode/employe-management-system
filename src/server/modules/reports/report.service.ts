import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, LeaveStatus, LeaveType } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { employeeScopeFor } from "@/server/auth/scope";
import { attendanceService } from "@/server/modules/attendance/attendance.service";
import { holidayService } from "@/server/modules/settings/holiday.service";
import {
  AttendanceReportData,
  CountItem,
  EmployeeReportData,
  LeaveReportData,
  LeaveReportRow,
  SalaryReportData,
} from "@/shared/types/report.types";
import { countWorkingDays, formatDate, monthRange } from "@/shared/utils/date";
import { getProbationDaysLeft } from "@/shared/utils/employee";

const ACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION];
const TREND_MONTHS = 6;
const OPEN_LEAVE_STATUSES: LeaveStatus[] = [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED];

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Aktif",
  PROBATION: "Masa Percobaan",
  RESIGNED: "Resign",
  TERMINATED: "Diberhentikan",
};

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "Cuti Tahunan",
  SICK: "Sakit",
  EMERGENCY: "Izin Penting",
  UNPAID: "Diluar Tanggungan",
};

const LEAVE_TYPE_COLUMN: Record<LeaveType, keyof Omit<LeaveReportRow, "nip" | "nama" | "total">> = {
  ANNUAL: "tahunan",
  SICK: "sakit",
  EMERGENCY: "penting",
  UNPAID: "diluarTanggungan",
};

function previousMonths(month: number, year: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
  });
}

const periodLabel = (month: number, year: number) => `${String(month).padStart(2, "0")}/${year}`;

function countBy<T>(items: T[], keyOf: (item: T) => string): CountItem[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) || 0) + 1);
  return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

class ReportService {
  async getSalaryTrend(employeeId?: string) {
    const groups = await prisma.salary.groupBy({
      by: ["periodYear", "periodMonth"],
      where: employeeId ? { employeeId } : {},
      _sum: { totalNet: true },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      take: TREND_MONTHS,
    });

    return groups.reverse().map((g) => ({
      month: `${g.periodMonth}/${g.periodYear}`,
      total: g._sum.totalNet || 0,
    }));
  }

  async getDepartmentDistribution() {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { employees: { where: { status: { in: ACTIVE_STATUSES } } } } } },
    });

    return departments
      .filter((d) => d._count.employees > 0)
      .map((d) => ({ name: d.name, count: d._count.employees }));
  }

  async getAttendanceReport(user: CurrentUser, month: number, year: number): Promise<AttendanceReportData> {
    const summary = await attendanceService.getMonthlySummary(user, month, year);

    const trend = [];
    for (const period of previousMonths(month, year, TREND_MONTHS)) {
      const monthly =
        period.month === month && period.year === year
          ? summary
          : await attendanceService.getMonthlySummary(user, period.month, period.year);
      trend.push({ label: periodLabel(period.month, period.year), ...monthly.totals });
    }

    return { ...summary, trend };
  }

  async getSalaryReport(month: number, year: number): Promise<SalaryReportData> {
    const salaries = await prisma.salary.findMany({
      where: { periodMonth: month, periodYear: year },
      include: { employee: { select: { department: { select: { name: true } } } } },
    });

    const byDepartment = new Map<string, { jumlahKaryawan: number; totalGross: number; totalNet: number }>();
    for (const s of salaries) {
      const divisi = s.employee.department?.name || "Tanpa Divisi";
      const row = byDepartment.get(divisi) || { jumlahKaryawan: 0, totalGross: 0, totalNet: 0 };
      row.jumlahKaryawan++;
      row.totalGross += s.totalGross;
      row.totalNet += s.totalNet;
      byDepartment.set(divisi, row);
    }

    const sum = (pick: (s: (typeof salaries)[number]) => number) => salaries.reduce((acc, s) => acc + pick(s), 0);
    const paid = salaries.filter((s) => s.isPaid).length;

    const trendGroups = await prisma.salary.groupBy({
      by: ["periodYear", "periodMonth"],
      where: { OR: previousMonths(month, year, TREND_MONTHS).map((p) => ({ periodMonth: p.month, periodYear: p.year })) },
      _sum: { totalNet: true },
    });
    const trend = previousMonths(month, year, TREND_MONTHS).map((p) => ({
      label: periodLabel(p.month, p.year),
      total: trendGroups.find((g) => g.periodMonth === p.month && g.periodYear === p.year)?._sum.totalNet || 0,
    }));

    return {
      totals: {
        slip: salaries.length,
        dibayar: paid,
        pending: salaries.length - paid,
        totalGross: sum((s) => s.totalGross),
        totalNet: sum((s) => s.totalNet),
        totalLembur: sum((s) => s.overtimePay),
        totalPotongan: sum((s) => s.deductions + s.unpaidLeaveCut),
        totalPph21: sum((s) => s.pph21),
        totalBpjsKaryawan: sum((s) => s.bpjsKesEmployee + s.jhtEmployee + s.jpEmployee),
        totalBpjsPerusahaan: sum((s) => s.bpjsKesEmployer + s.jhtEmployer + s.jpEmployer + s.jkkEmployer + s.jkmEmployer),
      },
      byDepartment: [...byDepartment].map(([divisi, row]) => ({ divisi, ...row })).sort((a, b) => b.totalNet - a.totalNet),
      trend,
    };
  }

  async getEmployeeReport(user: CurrentUser, month: number, year: number): Promise<EmployeeReportData> {
    const { start, end } = monthRange(month, year);
    const employees = await prisma.employee.findMany({
      where: employeeScopeFor(user),
      include: { department: true, position: true },
      orderBy: { name: "asc" },
    });

    const active = employees.filter((e) => ACTIVE_STATUSES.includes(e.status));
    const isNewHire = (joinDate: Date | null) => !!joinDate && joinDate >= start && joinDate <= end;

    const rows = employees.map((e) => {
      const notes: string[] = [];
      if (isNewHire(e.joinDate)) notes.push("Karyawan baru bulan ini");
      if (e.status === EmployeeStatus.PROBATION && e.joinDate) {
        const daysLeft = getProbationDaysLeft(e.joinDate);
        notes.push(daysLeft <= 0 ? "Masa percobaan selesai, perlu ditinjau" : `Percobaan berakhir ${daysLeft} hari lagi`);
      }
      return {
        nip: e.nip || "-",
        nama: e.name,
        divisi: e.department?.name || "-",
        jabatan: e.position?.name || "-",
        status: STATUS_LABELS[e.status],
        tanggalMasuk: e.joinDate ? formatDate(e.joinDate) : "-",
        keterangan: notes.join("; "),
      };
    });

    return {
      totals: {
        total: active.length,
        aktif: active.filter((e) => e.status === EmployeeStatus.ACTIVE).length,
        percobaan: active.filter((e) => e.status === EmployeeStatus.PROBATION).length,
        baru: employees.filter((e) => isNewHire(e.joinDate)).length,
      },
      byStatus: countBy(employees, (e) => STATUS_LABELS[e.status]),
      byDepartment: countBy(active, (e) => e.department?.name || "Tanpa Divisi"),
      byEmploymentType: countBy(active, (e) => e.employmentType.replace("_", " ")),
      rows,
    };
  }

  async getLeaveReport(user: CurrentUser, month: number, year: number): Promise<LeaveReportData> {
    const { start, end } = monthRange(month, year);
    const requests = await prisma.leaveRequest.findMany({
      where: { employee: employeeScopeFor(user), startDate: { lte: end }, endDate: { gte: start } },
      include: { employee: { select: { id: true, name: true, nip: true } } },
    });

    const approved = requests.filter((r) => r.status === LeaveStatus.HR_APPROVED);
    const holidays = await holidayService.keysBetween(start, end);
    const daysInMonth = (r: (typeof requests)[number]) =>
      countWorkingDays(r.startDate > start ? r.startDate : start, r.endDate < end ? r.endDate : end, holidays);

    const rowsBy = new Map<string, LeaveReportRow>();
    for (const r of approved) {
      const row = rowsBy.get(r.employee.id) || {
        nip: r.employee.nip || "-",
        nama: r.employee.name,
        tahunan: 0,
        sakit: 0,
        penting: 0,
        diluarTanggungan: 0,
        total: 0,
      };
      const days = daysInMonth(r);
      row[LEAVE_TYPE_COLUMN[r.type]] += days;
      row.total += days;
      rowsBy.set(r.employee.id, row);
    }

    const byType = (Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => ({
      label: LEAVE_TYPE_LABELS[type],
      value: approved.filter((r) => r.type === type).reduce((acc, r) => acc + daysInMonth(r), 0),
    }));

    return {
      totals: {
        pengajuan: requests.length,
        disetujui: approved.length,
        menunggu: requests.filter((r) => OPEN_LEAVE_STATUSES.includes(r.status)).length,
        ditolak: requests.filter((r) => r.status === LeaveStatus.REJECTED).length,
        hariCuti: byType.reduce((acc, t) => acc + t.value, 0),
      },
      byType,
      rows: [...rowsBy.values()].sort((a, b) => b.total - a.total),
    };
  }
}

export const reportService = new ReportService();
