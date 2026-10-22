import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { AttendanceReportData } from "@/shared/types/report.types";
import { AttendanceMonthlyRow } from "@/shared/types/attendance.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { BRAND_COLORS, CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from "@/shared/constants/theme";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const CSV_COLUMNS: CsvColumn<AttendanceMonthlyRow>[] = [
  { header: "NIP", value: (r) => r.nip },
  { header: "Nama", value: (r) => r.nama },
  { header: "Divisi", value: (r) => r.divisi },
  { header: "Hadir", value: (r) => r.hadir },
  { header: "Terlambat", value: (r) => r.terlambat },
  { header: "Izin/Cuti", value: (r) => r.izin },
  { header: "Sakit", value: (r) => r.sakit },
  { header: "Tidak Hadir", value: (r) => r.alpha },
  { header: "Total Menit Terlambat", value: (r) => r.menitTerlambat },
  { header: "Jam Lembur", value: (r) => r.jamLembur },
];

const TABLE_COLUMNS: { header: string; accessor: keyof AttendanceMonthlyRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium text-gray-900" },
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
  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Tingkat kehadiran", value: `${data.attendanceRate}%` },
          { label: "Hari hadir", value: data.totals.hadir, hint: `${data.totals.terlambat} kali terlambat` },
          { label: "Izin / sakit", value: data.totals.izin + data.totals.sakit },
          { label: "Tidak hadir", value: data.totals.alpha },
        ]}
      />

      <ReportSection title="Tren kehadiran" subtitle="Jumlah hari per status, 6 bulan terakhir">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="hadir" name="Hadir" fill={BRAND_COLORS.accent} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="izin" name="Izin/cuti" fill={BRAND_COLORS.brand} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="sakit" name="Sakit" fill="#d97706" radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="alpha" name="Tidak hadir" fill="#dc2626" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap per karyawan"
        subtitle={periodLabel}
        flush
        onExport={() => downloadCsv(`laporan-absensi-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
