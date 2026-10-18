"use server";

import { LeaveService } from "./leave.service";
import { LeaveType, LeaveStatus } from "@prisma/client";
import { ApiResponse } from "@/server/utils/api-response";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

const service = new LeaveService();

export async function requestLeaveAction(data: { type: LeaveType; startDate: Date; endDate: Date; reason: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return ApiResponse.error("Unauthorized");

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id }
    });

    if (!employee) return ApiResponse.error("Profil karyawan tidak ditemukan");

    const result = await service.requestLeave({ ...data, employeeId: employee.id });
    revalidatePath("/dashboard/leave");
    return ApiResponse.success("Pengajuan cuti berhasil dikirim", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengirim pengajuan cuti";
    return ApiResponse.error(errorMessage);
  }
}

export async function approveLeaveByManagerAction(requestId: string, managerId: string) {
  try {
    const result = await service.approveByManager(requestId, managerId);
    revalidatePath("/dashboard/leave");
    return ApiResponse.success("Cuti disetujui oleh Manager", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui cuti";
    return ApiResponse.error(errorMessage);
  }
}

export async function approveLeaveByHRAction(requestId: string, hrId: string) {
  try {
    const result = await service.approveByHR(requestId, hrId);
    revalidatePath("/dashboard/leave");
    return ApiResponse.success("Cuti disetujui oleh HR dan kuota diperbarui", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal menyetujui cuti";
    return ApiResponse.error(errorMessage);
  }
}

export async function getLeaveStatsAction() {
  try {
    const data = await service.getStats();
    return ApiResponse.success("Stats cuti berhasil diambil", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil statistik cuti";
    return ApiResponse.error(errorMessage);
  }
}

export async function getLeaveRequests() {
  const session = await auth();
  
  interface UserSession {
    role?: string | { name: string };
    employeeId?: string;
  }

  const user = session?.user as UserSession | undefined;
  const userRole = typeof user?.role === "string" ? user.role : user?.role?.name || "EMPLOYEE";
  const isAdminOrHR = userRole === "SUPER_ADMIN" || userRole === "HR";
  const currentUserEmployeeId = user?.employeeId;

  try {
    const requests = await prisma.leaveRequest.findMany({
      where: isAdminOrHR ? {} : { employeeId: currentUserEmployeeId },
      include: {
        employee: true,
        approver: {
          include: {
            role: true
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      orderBy: { createdAt: "desc" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any[];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return requests.map((req: any) => ({
      id: req.id,
      nip: req.employee.nip || "-",
      nama: req.employee.name,
      tipeCuti: req.type,
      tanggalMulai: req.startDate.toLocaleDateString('id-ID'),
      tanggalSelesai: req.endDate.toLocaleDateString('id-ID'),
      durasi: `${req.duration} Hari`,
      status: req.status,
      reason: req.reason,
      approvedBy: req.approver ? {
        name: req.approver.name,
        email: req.approver.email,
        role: req.approver.role?.name || "ADMIN"
      } : null
    }));
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return [];
  }
}

export async function createLeaveRequest(data: {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  interface UserSession {
    role?: string | { name: string };
    employeeId?: string;
  }

  const user = session.user as UserSession;
  const userRole = typeof user.role === "string" ? user.role : user.role?.name || "EMPLOYEE";
  const isAdminOrHR = userRole === "SUPER_ADMIN" || userRole === "HR";
  const currentUserEmployeeId = user.employeeId;

  // Security check: If not admin/hr, force use their own employee ID
  let targetEmployeeId = data.employeeId;
  if (!isAdminOrHR) {
    if (!currentUserEmployeeId) return { success: false, error: "Employee profile not found" };
    targetEmployeeId = currentUserEmployeeId;
  }

  try {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    await prisma.leaveRequest.create({
      data: {
        employeeId: targetEmployeeId,
        type: data.type,
        startDate: start,
        endDate: end,
        duration,
        reason: data.reason,
        status: "PENDING",
      },
    });
    
    revalidatePath("/dashboard/leave");
    return { success: true };
  } catch (error) {
    console.error("Failed to create leave request:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getEmployeesForLeave() {
  try {
    const employees = await prisma.employee.findMany({
      select: { id: true, name: true, nip: true },
      where: { status: "ACTIVE" }
    });
    return employees;
  } catch {
    return [];
  }
}

export async function updateLeaveStatus(id: string, status: LeaveStatus) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.leaveRequest.update({
      where: { id },
      data: { 
        status,
        approvedById: session.user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    revalidatePath("/dashboard/leave");
    return { success: true };
  } catch {
    return { success: false };
  }
}
