"use server";

import { auth } from "@/server/auth/auth";
import { ReportService } from "./report.service";
import { ApiResponse } from "@/server/utils/api-response";
import { prisma } from "@/server/db/prisma";

const service = new ReportService();

export async function getSalaryTrendAction() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    let employeeId: string | undefined;

    if (role === "EMPLOYEE") {
      const emp = await prisma.employee.findUnique({
        where: { userId: session?.user?.id }
      });
      employeeId = emp?.id;
    }

    const data = await service.getSalaryTrend(employeeId);
    return ApiResponse.success("Salary trend fetched", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil tren gaji";
    return ApiResponse.error(errorMessage);
  }
}

export async function getDeptDistributionAction() {
  try {
    const session = await auth();
    if (session?.user?.role === "EMPLOYEE") {
      return ApiResponse.error("Akses ditolak");
    }

    const data = await service.getDepartmentDistribution();
    return ApiResponse.success("Department distribution fetched", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil distribusi departemen";
    return ApiResponse.error(errorMessage);
  }
}
