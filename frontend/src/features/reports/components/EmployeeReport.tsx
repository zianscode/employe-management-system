import React from "react";
import { Hourglass, UserCheck, UserPlus, Users } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { CountItem, EmployeeReportData, EmployeeReportRow } from "@/shared/types/report.types";
import { downloadReportCSV } from "@/lib/api/download";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const TABLE_COLUMNS: { header: string; accessor: keyof EmployeeReportRow; className?: string }[] = [
  { header: "Nama", accessor: "nama", className: "font-medium text-foreground" },
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
      <CardHeading title={title} />
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada data</p>}
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums text-foreground">{item.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
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
          { label: "Total karyawan", value: data.totals.total, icon: Users },
          { label: "Status aktif", value: data.totals.aktif, icon: UserCheck, tone: "success" },
          { label: "Masa percobaan", value: data.totals.percobaan, icon: Hourglass, tone: "warning" },
          { label: "Karyawan baru", value: data.totals.baru, hint: periodLabel, icon: UserPlus, tone: "info" },
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
        onExport={() => downloadReportCSV("employees", fileSuffix)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.rows} />
      </ReportSection>
    </div>
  );
}
