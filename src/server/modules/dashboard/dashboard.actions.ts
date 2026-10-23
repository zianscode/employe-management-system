"use server";

import { requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { leaveService } from "@/server/modules/leave/leave.service";
import { attendanceCorrectionService } from "@/server/modules/attendance/attendance-correction.service";
import { PendingApprovals } from "@/shared/types/approval.types";
import { MyOverview } from "@/shared/types/history.types";
import { employeeHistoryService } from "@/server/modules/employees/employee-history.service";
import { isAdminRole } from "@/shared/constants/roles";
import { dashboardService } from "./dashboard.service";

export async function getDashboardStatsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Dashboard stats fetched", await dashboardService.getStats(user));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil data dashboard");
  }
}

export async function getPendingApprovalsAction() {
  try {
    const user = await requireUser();
    const [leave, attendanceCorrection] = await Promise.all([
      leaveService.countAwaitingDecision(user),
      attendanceCorrectionService.countAwaitingReview(user),
    ]);
    return ApiResponse.success<PendingApprovals>("Pending approvals", { leave, attendanceCorrection });
  } catch (error) {
    return ApiResponse.fromError<PendingApprovals>(error, "Gagal mengambil data persetujuan");
  }
}

export async function getMyOverviewAction() {
  try {
    const user = await requireUser();
    if (!user.employeeId || isAdminRole(user.role)) return ApiResponse.success<MyOverview | null>("Tidak ditampilkan", null);
    return ApiResponse.success<MyOverview | null>("Ringkasan", await employeeHistoryService.overview(user.employeeId));
  } catch (error) {
    return ApiResponse.fromError<MyOverview | null>(error, "Gagal mengambil ringkasan");
  }
}
