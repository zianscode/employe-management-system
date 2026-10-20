import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { AttendanceReportData } from "@/shared/types/report.types";
import { AttendanceMonthlyRow } from "@/shared/types/attendance.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
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
  { header: "Nama", accessor: "nama", className: "font-medium" },
  { header: "Divisi", accessor: "divisi" },
  { header: "Hadir", accessor: "hadir" },
  { header: "Terlambat", accessor: "terlambat" },
  { header: "Izin/Cuti", accessor: "izin" },
  { header: "Sakit", accessor: "sakit" },
  { header: "Tidak Hadir", accessor: "alpha" },
  { header: "Lembur (jam)", accessor: "jamLembur" },
];

interface AttendanceReportProps {
  data: AttendanceReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function AttendanceReport({ data, periodLabel, fileSuffix }: AttendanceReportProps) {
  return (
    <div className="space-y-4">
      <ReportStatCards
        cards={[
          { label: "Tingkat Kehadiran", value: `${data.attendanceRate}%`, tone: "green" },
          { label: "Hari Hadir", value: data.totals.hadir, hint: `${data.totals.terlambat} kali terlambat`, tone: "blue" },
          { label: "Izin / Sakit", value: data.totals.izin + data.totals.sakit, tone: "orange" },
          { label: "Tidak Hadir", value: data.totals.alpha, tone: "red" },
        ]}
      />

      <ReportSection title="Tren Kehadiran" subtitle="Jumlah hari per status, 6 bulan terakhir">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" name="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" name="Izin/Cuti" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sakit" name="Sakit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alpha" name="Tidak Hadir" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Rekap per Karyawan"
        subtitle={periodLabel}
        onExport={() => downloadCsv(`laporan-absensi-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
