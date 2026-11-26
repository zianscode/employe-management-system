"use client";

import React from "react";
import { CalendarX, Percent, Stethoscope, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { AttendanceReportData } from "@/shared/types/report.types";
import { AttendanceMonthlyRow } from "@/shared/types/attendance.types";
import { downloadReportCSV } from "@/lib/api/download";
import { useChartTheme } from "@/shared/hooks/use-chart-theme";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const TABLE_COLUMNS: { header: string; accessor: keyof AttendanceMonthlyRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium text-foreground" },
  { header: "Divisi", accessor: "divisi" },
  { header: "Hadir", accessor: "hadir", className: "tabular-nums" },
  { header: "Terlambat", accessor: "terlambat", className: "tabular-nums" },
  { header: "Izin/cuti", accessor: "izin", className: "tabular-nums" },
  { header: "Sakit", accessor: "sakit", className: "tabular-nums" },
  { header: "Tidak hadir", accessor: "alpha", className: "tabular-nums" },
  { header: "Lembur (jam)", accessor: "jamLembur", className: "tabular-nums" },
];

interface AttendanceReportProps {
  data: AttendanceReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function AttendanceReport({ data, periodLabel, fileSuffix }: AttendanceReportProps) {
  const chart = useChartTheme();
  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Tingkat kehadiran", value: `${data.attendanceRate}%`, icon: Percent, tone: "info" },
          { label: "Hari hadir", value: data.totals.hadir, hint: `${data.totals.terlambat} kali terlambat`, icon: UserCheck, tone: "success" },
          { label: "Izin / sakit", value: data.totals.izin + data.totals.sakit, icon: Stethoscope, tone: "warning" },
          { label: "Tidak hadir", value: data.totals.alpha, icon: CalendarX, tone: "destructive" },
        ]}
      />

      <ReportSection title="Tren kehadiran" subtitle="Jumlah hari per status, 6 bulan terakhir">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid vertical={false} stroke={chart.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={chart.tick} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={chart.tick} />
              <Tooltip cursor={{ fill: chart.cursor }} contentStyle={chart.tooltipStyle} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="hadir" name="Hadir" fill={chart.accent} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="izin" name="Izin/cuti" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="sakit" name="Sakit" fill={chart.warning} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="alpha" name="Tidak hadir" fill={chart.danger} radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap per karyawan"
        subtitle={periodLabel}
        flush
        onExport={() => downloadReportCSV("attendance", fileSuffix)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
