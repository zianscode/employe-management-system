import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { AccountInfo, AccountState } from "@/shared/types/settings.types";

const STATE_CONFIG: Record<AccountState, { variant: "success" | "secondary" | "destructive" | "warning"; label: string }> = {
  ACTIVE: { variant: "success", label: "Aktif" },
  INACTIVE: { variant: "secondary", label: "Nonaktif" },
  LOCKED: { variant: "destructive", label: "Terkunci" },
  MUST_CHANGE_PASSWORD: { variant: "warning", label: "Belum ganti password" },
};

export function AccountStateBadge({ account }: { account: AccountInfo }) {
  const config = STATE_CONFIG[account.state];
  return (
    <Badge variant={config.variant}>
      {config.label}
      {account.state === "LOCKED" && account.lockedUntil ? ` s.d. ${account.lockedUntil}` : ""}
    </Badge>
  );
}
