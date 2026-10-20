import React from "react";
import { StatData } from "@/features/attendance/components/AttendanceStats";
import { AttendanceClient } from "@/features/attendance/components/AttendanceClient";
import { getAttendanceStatsAction } from "@/server/modules/attendance/attendance.actions";

export default async function AttendancePage() {
  const statsRes = await getAttendanceStatsAction();
  const stats = (statsRes.success ? statsRes.data : []) as StatData[];

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <AttendanceClient stats={stats} />
    </div>
  );
}
