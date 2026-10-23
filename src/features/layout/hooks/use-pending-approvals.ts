"use client";

import { useEffect, useState } from "react";
import { getPendingApprovalsAction } from "@/server/modules/dashboard/dashboard.actions";
import { PendingApprovals } from "@/shared/types/approval.types";

const APPROVALS_CHANGED_EVENT = "approvals:changed";
const REFRESH_INTERVAL_MS = 60_000;

export function notifyApprovalsChanged() {
  window.dispatchEvent(new Event(APPROVALS_CHANGED_EVENT));
}

export function usePendingApprovals(pathname: string, enabled: boolean) {
  const [approvals, setApprovals] = useState<PendingApprovals>({ leave: 0, attendanceCorrection: 0 });

  useEffect(() => {
    if (!enabled) return;

    const load = async () => {
      const res = await getPendingApprovalsAction();
      if (res.success && res.data) setApprovals(res.data);
    };

    load();
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS);
    window.addEventListener(APPROVALS_CHANGED_EVENT, load);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(APPROVALS_CHANGED_EVENT, load);
    };
  }, [pathname, enabled]);

  return approvals;
}
