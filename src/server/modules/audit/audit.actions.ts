"use server";

import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { AuditLogRow } from "@/shared/types/audit.types";
import { auditService } from "./audit.service";

export async function getAuditLogsAction() {
  try {
    await requireRole(ADMIN_ROLES);
    return ApiResponse.success("Riwayat aktivitas", await auditService.list());
  } catch (error) {
    return ApiResponse.fromError<AuditLogRow[]>(error, "Gagal mengambil riwayat aktivitas");
  }
}
