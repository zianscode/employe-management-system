import React from "react";
import { StatData } from "@/features/attendance/components/AttendanceStats";
import { AttendanceClient } from "@/features/attendance/components/AttendanceClient";
import { Page } from "@/shared/components/ui/Page";
import { getAttendanceStatsAction } from "@/server/modules/attendance/attendance.actions";

export default async function AttendancePage() {
  const statsRes = await getAttendanceStatsAction();
  const stats = (statsRes.success ? statsRes.data : []) as StatData[];

  return (
    <Page>
      <AttendanceClient stats={stats} />
    </Page>
  );
}
