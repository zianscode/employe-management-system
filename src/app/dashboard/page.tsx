import React from "react";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardStats, { DashboardData } from "@/features/dashboard/components/DashboardStats";
import DashboardCharts, { SalaryData, DeptData } from "@/features/dashboard/components/DashboardCharts";

import { getDashboardStatsAction } from "@/server/modules/dashboard/dashboard.actions";
import { getSalaryTrendAction, getDeptDistributionAction } from "@/server/modules/reports/report.actions";

export default async function DashboardPage() {
  // Menarik data di sisi server
  const [statsRes, salaryRes, deptRes] = await Promise.all([
    getDashboardStatsAction(),
    getSalaryTrendAction(),
    getDeptDistributionAction(),
  ]);

  const dashboardData = (statsRes.success ? statsRes.data : null) as DashboardData | null;
  const salaryData = (salaryRes.success ? salaryRes.data : []) as SalaryData[];
  const deptData = (deptRes.success ? deptRes.data : []) as DeptData[];

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <DashboardHeader />
      <DashboardStats data={dashboardData} />
      <DashboardCharts salaryData={salaryData} deptData={deptData} />
    </div>
  );
}
