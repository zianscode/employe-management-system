"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ApprovalActionsProps {
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function ApprovalActions({
  canApprove,
  canReject,
  canCancel,
  onApprove,
  onReject,
  onCancel,
  disabled,
}: ApprovalActionsProps) {
  if (!canApprove && !canReject && !canCancel) return null;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {canApprove && (
        <Button size="sm" onClick={onApprove} disabled={disabled}>
          <Check />
          Setujui
        </Button>
      )}
      {canReject && (
        <Button size="sm" variant="outline" onClick={onReject} disabled={disabled}>
          <X />
          Tolak
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={disabled}>
          Batalkan
        </Button>
      )}
    </div>
  );
}
