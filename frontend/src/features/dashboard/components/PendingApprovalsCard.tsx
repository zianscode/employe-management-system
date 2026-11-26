import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { PendingApprovals } from "@/shared/types/approval.types";

export function PendingApprovalsCard({ approvals }: { approvals: PendingApprovals | null }) {
  if (!approvals) return null;

  const items = [
    { href: "/dashboard/leave", label: "Pengajuan cuti", count: approvals.leave },
    { href: "/dashboard/attendance", label: "Koreksi absensi", count: approvals.attendanceCorrection },
  ].filter((item) => item.count > 0);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeading title="Perlu persetujuan Anda" description="Pengajuan yang menunggu keputusan Anda" />
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/50">
              <span className="text-foreground">{item.label}</span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-destructive px-2 text-xs font-medium leading-5 text-white">{item.count}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
