"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireEmployee, requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { LeaveBalance, LeavePreview, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import { leaveService } from "./leave.service";

const refresh = () => {
  revalidatePath("/dashboard/leave");
  revalidatePath("/dashboard");
};

export async function getLeaveRequestsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Data cuti", await leaveService.list(user));
  } catch (error) {
    return ApiResponse.fromError<LeaveRequest[]>(error, "Gagal mengambil data cuti");
  }
}

export async function getLeaveStatsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Statistik cuti", await leaveService.getStats(user));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil statistik cuti");
  }
}

export async function getMyLeaveBalanceAction() {
  try {
    const user = await requireEmployee();
    return ApiResponse.success("Sisa cuti", await leaveService.getBalance(user.employeeId));
  } catch (error) {
    return ApiResponse.fromError<LeaveBalance>(error, "Gagal mengambil sisa cuti");
  }
}

export async function getLeavePreviewAction(input: { employeeId?: string; startDate: string; endDate?: string }) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Pratinjau cuti", await leaveService.preview(user, input));
  } catch (error) {
    return ApiResponse.fromError<LeavePreview>(error, "Gagal menghitung cuti");
  }
}

export async function getEmployeesForLeaveAction() {
  try {
    await requireRole(ADMIN_ROLES);
    const employees = await prisma.employee.findMany({
      select: { id: true, name: true, nip: true },
      where: { status: { in: ["ACTIVE", "PROBATION"] } },
      orderBy: { name: "asc" },
    });
    return ApiResponse.success("Karyawan", employees.map((e) => ({ ...e, nip: e.nip || "-" })));
  } catch (error) {
    return ApiResponse.fromError<{ id: string; name: string; nip: string }[]>(error, "Gagal mengambil data karyawan");
  }
}

export async function createLeaveRequestAction(input: LeaveRequestInput) {
  try {
    const user = await requireUser();
    await leaveService.request(user, input);
    refresh();
    return ApiResponse.success("Pengajuan cuti berhasil dikirim");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengirim pengajuan cuti");
  }
}

export async function approveLeaveAction(id: string) {
  try {
    const user = await requireEmployee();
    const result = await leaveService.approve(id, user);
    refresh();
    return ApiResponse.success(
      result.status === "MANAGER_APPROVED" ? "Disetujui atasan, menunggu persetujuan HR" : "Cuti disetujui"
    );
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menyetujui cuti");
  }
}

export async function rejectLeaveAction(id: string, reason: string) {
  try {
    const user = await requireEmployee();
    await leaveService.reject(id, user, reason);
    refresh();
    return ApiResponse.success("Pengajuan cuti ditolak");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menolak cuti");
  }
}

export async function cancelLeaveAction(id: string) {
  try {
    const user = await requireEmployee();
    await leaveService.cancel(id, user);
    refresh();
    return ApiResponse.success("Pengajuan cuti dibatalkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal membatalkan cuti");
  }
}
