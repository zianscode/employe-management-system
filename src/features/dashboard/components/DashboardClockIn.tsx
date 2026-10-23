"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClockInCard } from "@/features/attendance/components/ClockInCard";

export function DashboardClockIn() {
  const router = useRouter();
  return <ClockInCard onChange={() => router.refresh()} />;
}
