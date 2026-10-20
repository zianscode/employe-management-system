import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { LeaveReportData, LeaveReportRow } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
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
  { header: "Nama", accessor: "nama", className: "font-medium" },
  { header: "Tahunan", accessor: "tahunan" },
  { header: "Sakit", accessor: "sakit" },
  { header: "Penting", accessor: "penting" },
  { header: "Diluar Tanggungan", accessor: "diluarTanggungan" },
  { header: "Total Hari", accessor: "total", className: "font-bold" },
];

interface LeaveReportProps {
  data: LeaveReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function LeaveReport({ data, periodLabel, fileSuffix }: LeaveReportProps) {
  const { totals } = data;

  return (
    <div className="space-y-4">
      <ReportStatCards
        cards={[
          { label: "Total Pengajuan", value: totals.pengajuan, tone: "blue" },
          { label: "Disetujui", value: totals.disetujui, hint: `${totals.hariCuti} hari kerja`, tone: "green" },
          { label: "Menunggu", value: totals.menunggu, tone: "orange" },
          { label: "Ditolak", value: totals.ditolak, tone: "red" },
        ]}
      />

      <ReportSection title="Hari Cuti per Jenis" subtitle={`Cuti disetujui, ${periodLabel}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Hari" fill="#6700A3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap Cuti per Karyawan"
        subtitle="Jumlah hari kerja cuti yang disetujui"
        onExport={() => downloadCsv(`laporan-cuti-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
