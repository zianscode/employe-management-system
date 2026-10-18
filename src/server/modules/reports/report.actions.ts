"use server";

import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { APPROVER_ROLES, isAdminRole } from "@/shared/constants/roles";
import { reportService } from "./report.service";

export async function getSalaryTrendAction() {
  try {
    const user = await requireUser();
    const employeeId = isAdminRole(user.role) ? undefined : user.employeeId ?? "__none__";
    return ApiResponse.success("Salary trend fetched", await reportService.getSalaryTrend(employeeId));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil tren gaji");
  }
}

export async function getDeptDistributionAction() {
  try {
    await requireRole(APPROVER_ROLES);
    return ApiResponse.success("Department distribution fetched", await reportService.getDepartmentDistribution());
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil distribusi departemen");
  }
}
