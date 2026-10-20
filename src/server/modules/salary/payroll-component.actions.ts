"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { PayrollComponentRow } from "@/shared/types/salary.types";
import { PayrollComponentInput, payrollComponentService } from "./payroll-component.service";

export async function getPayrollComponentsAction(employeeId: string) {
  try {
    await requireRole(ADMIN_ROLES);
    return ApiResponse.success("Komponen gaji", await payrollComponentService.list(employeeId));
  } catch (error) {
    return ApiResponse.fromError<PayrollComponentRow[]>(error, "Gagal mengambil komponen gaji");
  }
}

export async function addPayrollComponentAction(employeeId: string, input: PayrollComponentInput) {
  try {
    await requireRole(ADMIN_ROLES);
    await payrollComponentService.create(employeeId, input);
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return ApiResponse.success("Komponen gaji ditambahkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menambah komponen gaji");
  }
}

export async function deletePayrollComponentAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    await payrollComponentService.remove(id);
    return ApiResponse.success("Komponen gaji dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus komponen gaji");
  }
}
