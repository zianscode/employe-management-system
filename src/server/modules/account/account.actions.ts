"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { auditService } from "@/server/modules/audit/audit.service";
import { accountService } from "./account.service";

export async function resetUserPasswordAction(userId: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    const temporaryPassword = await auditService.track(
      current,
      { action: "ACCOUNT_PASSWORD_RESET", entity: "ACCOUNT", entityId: userId },
      () => accountService.resetPassword(userId, current),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Password direset. Karyawan wajib menggantinya saat login.", { temporaryPassword });
  } catch (error) {
    return ApiResponse.fromError<{ temporaryPassword: string }>(error, "Gagal mereset password");
  }
}

export async function unlockUserAction(userId: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "ACCOUNT_UNLOCKED", entity: "ACCOUNT", entityId: userId }, () =>
      accountService.unlock(userId, current),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Akun dibuka kembali");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal membuka kunci akun");
  }
}
