"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SalaryRecord, SalarySlip } from "@/shared/types/salary.types";
import { payrollService } from "./payroll.service";

export async function getSalariesAction(month: number, year: number) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Data gaji", await payrollService.list(user, month, year));
  } catch (error) {
    return ApiResponse.fromError<SalaryRecord[]>(error, "Gagal mengambil data gaji");
  }
}

export async function generatePayrollAction(month: number, year: number) {
  try {
    await requireRole(ADMIN_ROLES);
    const { processed, skippedPaid } = await payrollService.generateMonthly(month, year);
    revalidatePath("/dashboard/salary");
    return ApiResponse.success(
      `Gaji ${processed} karyawan berhasil dihitung` + (skippedPaid ? ` (${skippedPaid} slip sudah dibayar, dilewati)` : "")
    );
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghitung gaji");
  }
}

export async function markSalaryPaidAction(salaryId: string) {
  try {
    await requireRole(ADMIN_ROLES);
    await payrollService.markAsPaid(salaryId);
    revalidatePath("/dashboard/salary");
    return ApiResponse.success("Slip gaji ditandai sudah dibayar");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui status gaji");
  }
}

export async function markPeriodPaidAction(month: number, year: number) {
  try {
    await requireRole(ADMIN_ROLES);
    const count = await payrollService.markPeriodAsPaid(month, year);
    revalidatePath("/dashboard/salary");
    return ApiResponse.success(count > 0 ? `${count} slip gaji ditandai sudah dibayar` : "Tidak ada slip yang belum dibayar");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui status gaji");
  }
}

export async function getSalarySlipAction(salaryId: string) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Slip gaji", await payrollService.getSlip(user, salaryId));
  } catch (error) {
    return ApiResponse.fromError<SalarySlip>(error, "Gagal mengambil slip gaji");
  }
}
