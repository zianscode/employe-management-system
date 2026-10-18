import { prisma } from "@/server/db/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";

export class DashboardService {
  async getStats(role: string, userId: string) {
    // Jika Role adalah EMPLOYEE, ambil data personal
    if (role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) throw new Error("Profil karyawan tidak ditemukan");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: today,
        },
      });

      const leaveQuota = 12; // Contoh jatah cuti
      const leaveTaken = await prisma.leaveRequest.aggregate({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.HR_APPROVED, // Gunakan enum yang benar
          type: LeaveType.ANNUAL,
        },
        _sum: { duration: true },
      });

      return {
        type: "PERSONAL",
        stats: {
          attendanceStatus: attendance?.status || "BELUM ABSEN",
          checkInTime: attendance?.checkIn || null,
          remainingLeave: leaveQuota - (leaveTaken._sum.duration || 0),
          totalSalaryReceived: await prisma.salary.count({ where: { employeeId: employee.id, isPaid: true } }),
        }
      };
    }

    // Jika Role adalah ADMIN/MANAGER, ambil data organisasi
    const totalEmployees = await prisma.employee.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentToday = await prisma.attendance.count({
      where: { date: { gte: today } },
    });

    const leaveRequests = await prisma.leaveRequest.count({
      where: { status: "PENDING" },
    });

    return {
      type: "ORGANIZATIONAL",
      stats: {
        totalEmployees,
        presentToday,
        leaveRequests,
        efficiency: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      }
    };
  }
}
