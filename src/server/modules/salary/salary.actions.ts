"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SalaryRecord } from "@/shared/types/salary.types";
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
