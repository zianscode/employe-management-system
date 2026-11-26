import React from "react";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardStats, { DashboardData } from "@/features/dashboard/components/DashboardStats";
import DashboardCharts, { SalaryData, DeptData } from "@/features/dashboard/components/DashboardCharts";
import { PendingApprovalsCard } from "@/features/dashboard/components/PendingApprovalsCard";
import { MyOverviewCards } from "@/features/dashboard/components/MyOverviewCards";
import { DashboardClockIn } from "@/features/dashboard/components/DashboardClockIn";
import { UpcomingHolidaysCard } from "@/features/attendance/components/UpcomingHolidaysCard";
import { Page } from "@/shared/components/PageLayout";
import {
  getDashboardStats,
  getMyOverview,
  getSalaryTrend,
  getDeptDistribution,
  getPendingApprovals,
  getUpcomingHolidays,
} from "@/lib/api/server";

export default async function DashboardPage() {
  const [statsRes, salaryRes, deptRes, approvalsRes, overviewRes, holidaysRes] = await Promise.all([
    getDashboardStats(),
    getSalaryTrend(),
    getDeptDistribution(),
    getPendingApprovals(),
    getMyOverview(),
    getUpcomingHolidays(3),
  ]);

  const dashboardData = (statsRes.success ? statsRes.data : null) as DashboardData | null;
  const salaryData = (salaryRes.success ? salaryRes.data : []) as SalaryData[];
  const deptData = (deptRes.success ? deptRes.data : []) as DeptData[];
  const approvals = approvalsRes.success ? approvalsRes.data ?? null : null;
  const overview = overviewRes.success ? overviewRes.data ?? null : null;
  const holidays = holidaysRes.success && holidaysRes.data ? holidaysRes.data : [];

  return (
    <Page>
      <DashboardHeader />
      <PendingApprovalsCard approvals={approvals} />
      <DashboardClockIn />
      <DashboardStats data={dashboardData} />
      {overview && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <MyOverviewCards overview={overview} />
          <UpcomingHolidaysCard holidays={holidays} />
        </div>
      )}
      <DashboardCharts salaryData={salaryData} deptData={deptData} />
    </Page>
  );
}
