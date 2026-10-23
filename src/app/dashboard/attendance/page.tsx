import React from "react";
import { StatData } from "@/features/attendance/components/AttendanceStats";
import { AttendanceClient } from "@/features/attendance/components/AttendanceClient";
import { Page } from "@/shared/components/ui/Page";
import { getAttendanceStatsAction } from "@/server/modules/attendance/attendance.actions";
import { getUpcomingHolidaysAction } from "@/server/modules/settings/holiday.actions";

export default async function AttendancePage() {
  const [statsRes, holidaysRes] = await Promise.all([getAttendanceStatsAction(), getUpcomingHolidaysAction(5)]);
  const stats = (statsRes.success ? statsRes.data : []) as StatData[];
  const holidays = holidaysRes.success && holidaysRes.data ? holidaysRes.data : [];

  return (
    <Page>
      <AttendanceClient stats={stats} holidays={holidays} />
    </Page>
  );
}
