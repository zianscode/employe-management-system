"use server";

import { requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { DashboardService } from "./dashboard.service";

const service = new DashboardService();

export async function getDashboardStatsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Dashboard stats fetched", await service.getStats(user));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil data dashboard");
  }
}
