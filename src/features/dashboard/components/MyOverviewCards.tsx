import React from "react";
import Link from "next/link";
import { MyOverview } from "@/shared/types/history.types";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { LEAVE_TYPE_LABELS } from "@/shared/constants/leave";
import { formatCurrency } from "@/shared/utils/format";

const linkClass = "text-sm font-medium text-brand hover:underline";

export function MyOverviewCards({ overview }: { overview: MyOverview }) {
  const { latestLeave, latestSalary } = overview;

  return (
    <>
      <Card>
        <CardHeader
          title="Pengajuan cuti terakhir"
          action={
            <Link href="/dashboard/leave" className={linkClass}>
              {latestLeave ? "Lihat semua" : "Ajukan cuti"}
            </Link>
          }
        />
        <CardBody>
          {latestLeave ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900">{LEAVE_TYPE_LABELS[latestLeave.type] ?? latestLeave.type}</span>
                <StatusBadge status={latestLeave.status} />
              </div>
              <p className="text-gray-500">
                {latestLeave.startDate} – {latestLeave.endDate} · {latestLeave.duration} hari kerja
              </p>
              {latestLeave.nextStep && <p className="text-gray-600">{latestLeave.nextStep}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Belum pernah mengajukan cuti.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Slip gaji terbaru"
          action={
            latestSalary && (
              <Link href={`/dashboard/salary/${latestSalary.id}/slip`} className={linkClass}>
                Buka slip
              </Link>
            )
          }
        />
        <CardBody>
          {latestSalary ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900">{latestSalary.periodLabel}</span>
                {latestSalary.isPaid ? <Badge tone="green">Dibayar</Badge> : <Badge tone="yellow">Belum dibayar</Badge>}
              </div>
              <p className="text-gray-500">
                Gaji bersih <span className="font-medium tabular-nums text-gray-900">{formatCurrency(latestSalary.totalNet)}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Slip gaji akan muncul setelah HR menghitung gaji bulanan.</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}
