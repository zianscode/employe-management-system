import React from "react";
import { StatData } from "@/features/attendance/components/AttendanceStats";
import { AttendanceClient } from "@/features/attendance/components/AttendanceClient";
import { Page } from "@/shared/components/PageLayout";
import { getAttendanceStats, getUpcomingHolidays } from "@/lib/api/server";

export default async function AttendancePage() {
  const [statsRes, holidaysRes] = await Promise.all([getAttendanceStats(), getUpcomingHolidays(5)]);
  const stats = (statsRes.success ? statsRes.data : []) as StatData[];
  const holidays = holidaysRes.success && holidaysRes.data ? holidaysRes.data : [];

  return (
    <Page>
      <AttendanceClient stats={stats} holidays={holidays} />
    </Page>
  );
}
