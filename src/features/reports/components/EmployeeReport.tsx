import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { CountItem, EmployeeReportData, EmployeeReportRow } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const CSV_COLUMNS: CsvColumn<EmployeeReportRow>[] = [
  { header: "NIP", value: (r) => r.nip },
  { header: "Nama", value: (r) => r.nama },
  { header: "Divisi", value: (r) => r.divisi },
  { header: "Jabatan", value: (r) => r.jabatan },
  { header: "Status", value: (r) => r.status },
  { header: "Tanggal Masuk", value: (r) => r.tanggalMasuk },
  { header: "Keterangan", value: (r) => r.keterangan },
];

const TABLE_COLUMNS: { header: string; accessor: keyof EmployeeReportRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium" },
  { header: "Divisi", accessor: "divisi" },
  { header: "Jabatan", accessor: "jabatan" },
  { header: "Status", accessor: "status" },
  { header: "Masuk", accessor: "tanggalMasuk" },
  { header: "Keterangan", accessor: "keterangan" },
];

function Breakdown({ title, items }: { title: string; items: CountItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
      {items.length === 0 && <p className="text-sm text-gray-400">Tidak ada data</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-brand rounded-full" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EmployeeReportProps {
  data: EmployeeReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function EmployeeReport({ data, periodLabel, fileSuffix }: EmployeeReportProps) {
  return (
    <div className="space-y-4">
      <ReportStatCards
        cards={[
          { label: "Karyawan Aktif", value: data.totals.total, tone: "blue" },
          { label: "Status Aktif", value: data.totals.aktif, tone: "green" },
          { label: "Masa Percobaan", value: data.totals.percobaan, tone: "orange" },
          { label: "Karyawan Baru", value: data.totals.baru, hint: periodLabel, tone: "purple" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Breakdown title="Per Divisi" items={data.byDepartment} />
        <Breakdown title="Per Tipe Kerja" items={data.byEmploymentType} />
        <Breakdown title="Per Status" items={data.byStatus} />
      </div>

      <ReportSection
        title="Daftar Karyawan"
        subtitle="Termasuk catatan karyawan baru dan masa percobaan"
        onExport={() => downloadCsv(`laporan-karyawan-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
