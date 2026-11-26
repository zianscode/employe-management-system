"use client";

import React from "react";
import { CalendarCheck, CalendarDays, CalendarX, Hourglass } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { LeaveReportData, LeaveReportRow } from "@/shared/types/report.types";
import { downloadReportCSV } from "@/lib/api/download";
import { useChartTheme } from "@/shared/hooks/use-chart-theme";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const TABLE_COLUMNS: { header: string; accessor: keyof LeaveReportRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium text-foreground" },
  { header: "Tahunan", accessor: "tahunan", className: "tabular-nums" },
  { header: "Sakit", accessor: "sakit", className: "tabular-nums" },
  { header: "Izin penting", accessor: "penting", className: "tabular-nums" },
  { header: "Di luar tanggungan", accessor: "diluarTanggungan", className: "tabular-nums" },
  { header: "Total hari", accessor: "total", className: "font-medium tabular-nums text-foreground" },
];

interface LeaveReportProps {
  data: LeaveReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function LeaveReport({ data, periodLabel, fileSuffix }: LeaveReportProps) {
  const chart = useChartTheme();
  const { totals } = data;

  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Total pengajuan", value: totals.pengajuan, icon: CalendarDays },
          { label: "Disetujui", value: totals.disetujui, hint: `${totals.hariCuti} hari kerja`, icon: CalendarCheck, tone: "success" },
          { label: "Menunggu", value: totals.menunggu, icon: Hourglass, tone: "warning" },
          { label: "Ditolak", value: totals.ditolak, icon: CalendarX, tone: "destructive" },
        ]}
      />

      <ReportSection title="Hari cuti per jenis" subtitle={`Cuti disetujui, ${periodLabel}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byType}>
              <CartesianGrid vertical={false} stroke={chart.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={chart.tick} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={chart.tick} />
              <Tooltip cursor={{ fill: chart.cursor }} contentStyle={chart.tooltipStyle} />
              <Bar dataKey="value" name="Hari" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap cuti per karyawan"
        subtitle="Jumlah hari kerja cuti yang disetujui"
        flush
        onExport={() => downloadReportCSV("leave", fileSuffix)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
