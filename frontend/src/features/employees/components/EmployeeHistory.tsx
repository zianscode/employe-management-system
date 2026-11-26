import React from "react";
import Link from "next/link";
import { EmployeeHistory as EmployeeHistoryData } from "@/shared/types/history.types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Badge } from "@/shared/components/ui/badge";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { LEAVE_TYPE_LABELS } from "@/shared/constants/leave";
import { formatCurrency } from "@/shared/utils/format";

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export function EmployeeHistory({ history }: { history: EmployeeHistoryData }) {
  const { attendance, leaves, salaries } = history;

  return (
    <>
      <Card>
        <CardHeading title={`Absensi ${attendance.periodLabel}`} description="Dihitung dari catatan check-in sampai hari ini" />
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Metric label="Hari hadir" value={attendance.present} />
            <Metric label="Terlambat" value={`${attendance.late}×`} />
            <Metric label="Pulang cepat" value={`${attendance.earlyLeave}×`} />
            <Metric label="Total terlambat" value={`${attendance.lateMinutes} menit`} />
            <Metric label="Lembur" value={`${attendance.overtimeHours} jam`} />
            <Metric label="Cuti disetujui" value={`${attendance.leaveDays} hari`} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeading
          title="Riwayat cuti"
          description="5 pengajuan terakhir"
          action={
            <Link href="/dashboard/leave" className="text-sm font-medium text-primary hover:underline">
              Semua cuti
            </Link>
          }
        />
        {leaves.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">Belum pernah mengajukan cuti.</p>
        ) : (
          <ul className="divide-y divide-border">
            {leaves.map((leave) => (
              <li key={leave.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <p className="text-foreground">{LEAVE_TYPE_LABELS[leave.type] ?? leave.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.startDate} – {leave.endDate} · {leave.duration} hari kerja
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={leave.status} />
                  {leave.nextStep && <span className="text-xs text-muted-foreground">{leave.nextStep}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeading title="Slip gaji" description="6 periode terakhir" />
        {salaries.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">Belum ada slip gaji.</p>
        ) : (
          <ul className="divide-y divide-border">
            {salaries.map((salary) => (
              <li key={salary.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-foreground">{salary.periodLabel}</span>
                <div className="flex items-center gap-4">
                  <span className="tabular-nums text-foreground">{formatCurrency(salary.totalNet)}</span>
                  {salary.isPaid ? <Badge variant="success">Dibayar</Badge> : <Badge variant="warning">Belum dibayar</Badge>}
                  <Link href={`/dashboard/salary/${salary.id}/slip`} className="font-medium text-primary hover:underline">
                    Slip
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
