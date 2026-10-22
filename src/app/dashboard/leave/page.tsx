import React from "react";
import { LeaveStatData } from "@/features/leave/components/LeaveStats";
import { LeaveClient } from "@/features/leave/components/LeaveClient";
import { Page } from "@/shared/components/ui/Page";
import { getLeaveStatsAction, getMyLeaveBalanceAction } from "@/server/modules/leave/leave.actions";

export default async function LeavePage() {
  const [statsRes, balanceRes] = await Promise.all([getLeaveStatsAction(), getMyLeaveBalanceAction()]);
  const stats = (statsRes.success ? statsRes.data : []) as LeaveStatData[];
  const balance = balanceRes.success ? balanceRes.data ?? null : null;

  return (
    <Page>
      <LeaveClient stats={stats} balance={balance} />
    </Page>
  );
}
