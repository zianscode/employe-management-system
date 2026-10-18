"use server";

import { auth } from "@/server/auth/auth";
import { DashboardService } from "./dashboard.service";
import { ApiResponse } from "@/server/utils/api-response";

const service = new DashboardService();

export async function getDashboardStatsAction() {
  try {
    const session = await auth();
    if (!session?.user) {
      return ApiResponse.error("Unauthorized");
    }

    const roleName = session.user.role || "EMPLOYEE";
    const userId = session.user.id;

    if (!userId) {
      return ApiResponse.error("User ID not found");
    }

    const result = await service.getStats(roleName, userId);
    
    return ApiResponse.success("Dashboard stats fetched", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil data dashboard";
    return ApiResponse.error(errorMessage);
  }
}
