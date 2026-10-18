"use server";

import { requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { dashboardService } from "./dashboard.service";

export async function getDashboardStatsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Dashboard stats fetched", await dashboardService.getStats(user));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil data dashboard");
  }
}
