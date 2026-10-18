"use server";

import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES, isAdminRole, ROLES } from "@/shared/constants/roles";
import { ReportService } from "./report.service";

const service = new ReportService();

/** HR/Admin: total gaji perusahaan. Selain itu: gaji milik sendiri. */
export async function getSalaryTrendAction() {
  try {
    const user = await requireUser();
    const employeeId = isAdminRole(user.role) ? undefined : user.employeeId ?? "__none__";
    return ApiResponse.success("Salary trend fetched", await service.getSalaryTrend(employeeId));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil tren gaji");
  }
}

export async function getDeptDistributionAction() {
  try {
    await requireRole([...ADMIN_ROLES, ROLES.MANAGER]);
    return ApiResponse.success("Department distribution fetched", await service.getDepartmentDistribution());
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil distribusi departemen");
  }
}
