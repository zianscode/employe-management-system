import { prisma } from "@/server/db/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";

export class LeaveService {
  async requestLeave(data: { employeeId: string; type: LeaveType; startDate: Date; endDate: Date; reason: string }) {
    // 1. Calculate Duration
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 2. Validate Overlapping
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: data.employeeId,
        status: { notIn: [LeaveStatus.REJECTED, LeaveStatus.CANCELLED] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });
    if (overlapping) throw new Error("You already have a leave request on these dates");

    // 3. Check Quota (If Annual)
    if (data.type === LeaveType.ANNUAL) {
      const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
      if (!employee || employee.leaveQuota < duration) throw new Error("Insufficient leave quota");
    }

    // 4. Create Request
    return await prisma.leaveRequest.create({
      data: { ...data, duration, status: LeaveStatus.PENDING }
    });
  }

  async approveByManager(requestId: string, managerId: string) {
    return await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: LeaveStatus.MANAGER_APPROVED, approvedById: managerId }
    });
  }

  async approveByHR(requestId: string, hrId: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Request not found");

    // Reduce Quota
    if (request.type === LeaveType.ANNUAL) {
      await prisma.employee.update({
        where: { id: request.employeeId },
        data: { leaveQuota: { decrement: request.duration } }
      });
    }

    return await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: LeaveStatus.HR_APPROVED, approvedById: hrId }
    });
  }

  async getStats() {
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.leaveRequest.count(),
      prisma.leaveRequest.count({ where: { status: { in: [LeaveStatus.MANAGER_APPROVED, LeaveStatus.HR_APPROVED] } } }),
      prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
      prisma.leaveRequest.count({ where: { status: LeaveStatus.REJECTED } }),
    ]);

    return [
      { label: "Total Permohonan", value: total.toString(), change: "+0", type: "neutral" },
      { label: "Disetujui", value: approved.toString(), change: "+0", type: "success" },
      { label: "Pending", value: pending.toString(), change: "+0", type: "warning" },
      { label: "Ditolak", value: rejected.toString(), change: "+0", type: "danger" },
    ];
  }
}
