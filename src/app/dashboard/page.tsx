"use client";

import React from "react";
import DashboardHeader from "@/features/dashboard/presentation/components/DashboardHeader";
import DashboardStats from "@/features/dashboard/presentation/components/DashboardStats";
import DashboardCharts from "@/features/dashboard/presentation/components/DashboardCharts";

export default function DashboardPage() {
  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
    </div>
  );
}



