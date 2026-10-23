import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/shared/components/ui/Card";
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
      <CardHeader title="Perlu persetujuan Anda" description="Pengajuan yang menunggu keputusan Anda" />
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-50">
              <span className="text-gray-700">{item.label}</span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-red-600 px-2 text-xs font-medium leading-5 text-white">{item.count}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
