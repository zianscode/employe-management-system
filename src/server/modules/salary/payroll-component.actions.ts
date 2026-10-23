"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { auditService } from "@/server/modules/audit/audit.service";
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
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(
      current,
      { action: "PAYROLL_COMPONENT_ADDED", entity: "EMPLOYEE", entityId: employeeId, detail: `${input.name}: Rp${input.amount.toLocaleString("id-ID")}` },
      () => payrollComponentService.create(employeeId, input),
    );
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return ApiResponse.success("Komponen gaji ditambahkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menambah komponen gaji");
  }
}

export async function deletePayrollComponentAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "PAYROLL_COMPONENT_DELETED", entity: "PAYROLL_COMPONENT", entityId: id }, () =>
      payrollComponentService.remove(id),
    );
    return ApiResponse.success("Komponen gaji dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus komponen gaji");
  }
}
