import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, LeaveStatus } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { ROLES } from "@/shared/constants/roles";
import { attendanceService } from "@/server/modules/attendance/attendance.service";
import { leaveService } from "@/server/modules/leave/leave.service";
import { dateKeyToDate, toDateKey } from "@/shared/utils/date";
import { ATTENDANCE_STATUS_LABELS } from "@/shared/constants/attendance";

class DashboardService {
  async getStats(user: CurrentUser) {
    if (user.role === ROLES.EMPLOYEE) {
      if (!user.employeeId) throw new Error("Profil karyawan tidak ditemukan");

      const [today, balance, paidSalaries] = await Promise.all([
        attendanceService.getMyToday(user.employeeId),
        leaveService.getBalance(user.employeeId),
        prisma.salary.count({ where: { employeeId: user.employeeId, isPaid: true } }),
      ]);

      return {
        type: "PERSONAL" as const,
        stats: {
          attendanceStatus: ATTENDANCE_STATUS_LABELS[today.status] ?? today.status,
          checkInTime: today.checkIn,
          remainingLeave: balance.remaining,
          totalSalaryReceived: paidSalaries,
        },
      };
    }

    const today = dateKeyToDate(toDateKey());
    const [totalEmployees, presentToday, leaveRequests] = await Promise.all([
      prisma.employee.count({ where: { status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] } } }),
      prisma.attendance.count({ where: { date: today } }),
      prisma.leaveRequest.count({ where: { status: { in: [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED] } } }),
    ]);

    return {
      type: "ORGANIZATIONAL" as const,
      stats: {
        totalEmployees,
        presentToday,
        leaveRequests,
        efficiency: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      },
    };
  }
}

export const dashboardService = new DashboardService();
