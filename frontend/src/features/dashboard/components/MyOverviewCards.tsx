import React from "react";
import Link from "next/link";
import { MyOverview } from "@/shared/types/history.types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Badge } from "@/shared/components/ui/badge";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { LEAVE_TYPE_LABELS } from "@/shared/constants/leave";
import { formatCurrency } from "@/shared/utils/format";

const linkClass = "text-sm font-medium text-primary hover:underline";

export function MyOverviewCards({ overview }: { overview: MyOverview }) {
  const { latestLeave, latestSalary } = overview;

  return (
    <>
      <Card>
        <CardHeading
          title="Pengajuan cuti terakhir"
          action={
            <Link href="/dashboard/leave" className={linkClass}>
              {latestLeave ? "Lihat semua" : "Ajukan cuti"}
            </Link>
          }
        />
        <CardContent>
          {latestLeave ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{LEAVE_TYPE_LABELS[latestLeave.type] ?? latestLeave.type}</span>
                <StatusBadge status={latestLeave.status} />
              </div>
              <p className="text-muted-foreground">
                {latestLeave.startDate} – {latestLeave.endDate} · {latestLeave.duration} hari kerja
              </p>
              {latestLeave.nextStep && <p className="text-muted-foreground">{latestLeave.nextStep}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum pernah mengajukan cuti.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeading
          title="Slip gaji terbaru"
          action={
            latestSalary && (
              <Link href={`/dashboard/salary/${latestSalary.id}/slip`} className={linkClass}>
                Buka slip
              </Link>
            )
          }
        />
        <CardContent>
          {latestSalary ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{latestSalary.periodLabel}</span>
                {latestSalary.isPaid ? <Badge variant="success">Dibayar</Badge> : <Badge variant="warning">Belum dibayar</Badge>}
              </div>
              <p className="text-muted-foreground">
                Gaji bersih <span className="font-medium tabular-nums text-foreground">{formatCurrency(latestSalary.totalNet)}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Slip gaji akan muncul setelah HR menghitung gaji bulanan.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
