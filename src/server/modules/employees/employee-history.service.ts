import { prisma } from "@/server/db/prisma";
import { AttendanceStatus, LeaveStatus, Prisma } from "@prisma/client";
import { AttendanceSummary, EmployeeHistory, LeaveHistoryItem, MyOverview, SalaryHistoryItem } from "@/shared/types/history.types";
import { formatDate, formatPeriod, monthRange, toDateKey } from "@/shared/utils/date";
import { describeLeaveNextStep } from "@/shared/utils/leave";

const leaveSelect = {
  id: true,
  type: true,
  startDate: true,
  endDate: true,
  duration: true,
  status: true,
  employee: { select: { manager: { select: { name: true } } } },
} satisfies Prisma.LeaveRequestSelect;

type LeaveRow = Prisma.LeaveRequestGetPayload<{ select: typeof leaveSelect }>;

const salarySelect = {
  id: true,
  periodMonth: true,
  periodYear: true,
  totalNet: true,
  isPaid: true,
} satisfies Prisma.SalarySelect;

type SalaryRow = Prisma.SalaryGetPayload<{ select: typeof salarySelect }>;

const round1 = (n: number) => Math.round(n * 10) / 10;

class EmployeeHistoryService {
  private toLeaveItem(leave: LeaveRow): LeaveHistoryItem {
    return {
      id: leave.id,
      type: leave.type,
      startDate: formatDate(leave.startDate),
      endDate: formatDate(leave.endDate),
      duration: leave.duration,
      status: leave.status,
      nextStep: describeLeaveNextStep(leave.status, leave.employee.manager?.name),
    };
  }

  private toSalaryItem(salary: SalaryRow): SalaryHistoryItem {
    return {
      id: salary.id,
      periodLabel: formatPeriod(salary.periodMonth, salary.periodYear),
      totalNet: salary.totalNet,
      isPaid: salary.isPaid,
    };
  }

  async attendanceThisMonth(employeeId: string): Promise<AttendanceSummary> {
    const [year, month] = toDateKey().split("-").map(Number);
    const { start, end } = monthRange(month, year);

    const [records, leaves] = await Promise.all([
      prisma.attendance.findMany({
        where: { employeeId, date: { gte: start, lte: end } },
        select: { status: true, lateInMinutes: true, overtimeHours: true },
      }),
      prisma.leaveRequest.aggregate({
        where: { employeeId, status: LeaveStatus.HR_APPROVED, startDate: { gte: start, lte: end } },
        _sum: { duration: true },
      }),
    ]);

    const count = (status: AttendanceStatus) => records.filter((r) => r.status === status).length;

    return {
      periodLabel: formatPeriod(month, year),
      present: count(AttendanceStatus.PRESENT) + count(AttendanceStatus.LATE) + count(AttendanceStatus.EARLY_LEAVE),
      late: count(AttendanceStatus.LATE),
      earlyLeave: count(AttendanceStatus.EARLY_LEAVE),
      lateMinutes: records.reduce((sum, r) => sum + r.lateInMinutes, 0),
      overtimeHours: round1(records.reduce((sum, r) => sum + r.overtimeHours, 0)),
      leaveDays: leaves._sum.duration ?? 0,
    };
  }

  async forEmployee(employeeId: string): Promise<EmployeeHistory> {
    const [attendance, leaves, salaries] = await Promise.all([
      this.attendanceThisMonth(employeeId),
      prisma.leaveRequest.findMany({ where: { employeeId }, select: leaveSelect, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.salary.findMany({
        where: { employeeId },
        select: salarySelect,
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
        take: 6,
      }),
    ]);

    return {
      attendance,
      leaves: leaves.map((l) => this.toLeaveItem(l)),
      salaries: salaries.map((s) => this.toSalaryItem(s)),
    };
  }

  async overview(employeeId: string): Promise<MyOverview> {
    const [latestLeave, latestSalary] = await Promise.all([
      prisma.leaveRequest.findFirst({ where: { employeeId }, select: leaveSelect, orderBy: { createdAt: "desc" } }),
      prisma.salary.findFirst({
        where: { employeeId },
        select: salarySelect,
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      }),
    ]);

    return {
      latestLeave: latestLeave ? this.toLeaveItem(latestLeave) : null,
      latestSalary: latestSalary ? this.toSalaryItem(latestSalary) : null,
    };
  }
}

export const employeeHistoryService = new EmployeeHistoryService();
