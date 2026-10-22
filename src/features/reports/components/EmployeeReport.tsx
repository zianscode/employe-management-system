import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { CountItem, EmployeeReportData, EmployeeReportRow } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
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
  { header: "Nama", accessor: "nama", className: "font-medium text-gray-900" },
  { header: "Divisi", accessor: "divisi" },
  { header: "Jabatan", accessor: "jabatan" },
  { header: "Status", accessor: "status" },
  { header: "Masuk", accessor: "tanggalMasuk" },
  { header: "Keterangan", accessor: "keterangan" },
];

function Breakdown({ title, items }: { title: string; items: CountItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-500">Tidak ada data</p>}
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium tabular-nums text-gray-900">{item.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-brand" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

interface EmployeeReportProps {
  data: EmployeeReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function EmployeeReport({ data, periodLabel, fileSuffix }: EmployeeReportProps) {
  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Total karyawan", value: data.totals.total },
          { label: "Status aktif", value: data.totals.aktif },
          { label: "Masa percobaan", value: data.totals.percobaan },
          { label: "Karyawan baru", value: data.totals.baru, hint: periodLabel },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Breakdown title="Per divisi" items={data.byDepartment} />
        <Breakdown title="Per tipe kerja" items={data.byEmploymentType} />
        <Breakdown title="Per status" items={data.byStatus} />
      </div>

      <ReportSection
        title="Daftar karyawan"
        subtitle="Termasuk catatan karyawan baru dan masa percobaan"
        flush
        onExport={() => downloadCsv(`laporan-karyawan-${fileSuffix}`, data.rows, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
