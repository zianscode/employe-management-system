"use client";

import { useState } from "react";
import { toast } from "sonner";
import { resetUserPassword, unlockUser } from "@/lib/api/client";

export interface AccountTarget {
  userId: string;
  name: string;
}

export function useAccountActions(onChanged: () => void) {
  const [resetTarget, setResetTarget] = useState<AccountTarget | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<{ password: string; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmReset = async () => {
    if (!resetTarget) return;
    setIsProcessing(true);
    const res = await resetUserPassword(resetTarget.userId);
    setIsProcessing(false);
    if (res.success && res.data) {
      setTemporaryPassword({ password: res.data.temporaryPassword, name: resetTarget.name });
      setResetTarget(null);
      onChanged();
    } else {
      toast.error(res.message);
    }
  };

  const unlock = async (userId: string) => {
    setIsProcessing(true);
    const res = await unlockUser(userId);
    setIsProcessing(false);
    if (res.success) {
      toast.success(res.message);
      onChanged();
    } else {
      toast.error(res.message);
    }
  };

  return {
    resetTarget,
    requestReset: setResetTarget,
    cancelReset: () => setResetTarget(null),
    confirmReset,
    unlock,
    temporaryPassword,
    closeTemporaryPassword: () => setTemporaryPassword(null),
    isProcessing,
  };
}
