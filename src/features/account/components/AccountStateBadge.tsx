import React from "react";
import { Badge, BadgeTone } from "@/shared/components/ui/Badge";
import { AccountInfo, AccountState } from "@/shared/types/settings.types";

const STATE_CONFIG: Record<AccountState, { tone: BadgeTone; label: string }> = {
  ACTIVE: { tone: "green", label: "Aktif" },
  INACTIVE: { tone: "gray", label: "Nonaktif" },
  LOCKED: { tone: "red", label: "Terkunci" },
  MUST_CHANGE_PASSWORD: { tone: "yellow", label: "Belum ganti password" },
};

export function AccountStateBadge({ account }: { account: AccountInfo }) {
  const config = STATE_CONFIG[account.state];
  return (
    <Badge tone={config.tone}>
      {config.label}
      {account.state === "LOCKED" && account.lockedUntil ? ` s.d. ${account.lockedUntil}` : ""}
    </Badge>
  );
}
