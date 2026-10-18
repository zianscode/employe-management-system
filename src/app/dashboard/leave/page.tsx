import React from "react";
import { LeaveStatData } from "@/features/leave/components/LeaveStats";
import { LeaveClient } from "@/features/leave/components/LeaveClient";
import { getLeaveStatsAction } from "@/server/modules/leave/leave.actions";

import { auth } from "@/server/auth/auth";

export default async function LeavePage() {
  const session = await auth();
  const userRole = session?.user?.role || "EMPLOYEE";
    
  const statsRes = await getLeaveStatsAction();
  const stats = (statsRes.success ? statsRes.data : []) as LeaveStatData[];

  return (
    <div className="py-4 pl-8 pr-6">
      <LeaveClient stats={stats} userRole={userRole} />
    </div>
  );
}
