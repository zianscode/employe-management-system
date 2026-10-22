import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { LeaveReportData, LeaveReportRow } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { BRAND_COLORS, CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from "@/shared/constants/theme";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const CSV_COLUMNS: CsvColumn<LeaveReportRow>[] = [
  { header: "NIP", value: (r) => r.nip },
  { header: "Nama", value: (r) => r.nama },
  { header: "Cuti Tahunan", value: (r) => r.tahunan },
  { header: "Sakit", value: (r) => r.sakit },
  { header: "Izin Penting", value: (r) => r.penting },
  { header: "Diluar Tanggungan", value: (r) => r.diluarTanggungan },
  { header: "Total Hari", value: (r) => r.total },
];

const TABLE_COLUMNS: { header: string; accessor: keyof LeaveReportRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium text-gray-900" },
  { header: "Tahunan", accessor: "tahunan", className: "tabular-nums" },
  { header: "Sakit", accessor: "sakit", className: "tabular-nums" },
  { header: "Izin penting", accessor: "penting", className: "tabular-nums" },
  { header: "Di luar tanggungan", accessor: "diluarTanggungan", className: "tabular-nums" },
  { header: "Total hari", accessor: "total", className: "font-medium tabular-nums text-gray-900" },
];

interface LeaveReportProps {
  data: LeaveReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function LeaveReport({ data, periodLabel, fileSuffix }: LeaveReportProps) {
  const { totals } = data;

  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Total pengajuan", value: totals.pengajuan },
          { label: "Disetujui", value: totals.disetujui, hint: `${totals.hariCuti} hari kerja` },
          { label: "Menunggu", value: totals.menunggu },
          { label: "Ditolak", value: totals.ditolak },
        ]}
      />

      <ReportSection title="Hari cuti per jenis" subtitle={`Cuti disetujui, ${periodLabel}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byType}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Hari" fill={BRAND_COLORS.brand} radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap cuti per karyawan"
        subtitle="Jumlah hari kerja cuti yang disetujui"
        flush
        onExport={() => downloadCsv(`laporan-cuti-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
