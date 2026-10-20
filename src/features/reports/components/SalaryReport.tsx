import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryDepartmentRow, SalaryReportData } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { formatCurrency } from "@/shared/utils/format";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const CSV_COLUMNS: CsvColumn<SalaryDepartmentRow>[] = [
  { header: "Divisi", value: (r) => r.divisi },
  { header: "Jumlah Karyawan", value: (r) => r.jumlahKaryawan },
  { header: "Total Gross", value: (r) => r.totalGross },
  { header: "Total Net", value: (r) => r.totalNet },
];

const TABLE_COLUMNS: { header: string; accessor: keyof SalaryDepartmentRow | ((r: SalaryDepartmentRow) => React.ReactNode); className?: string }[] = [
  { header: "Divisi", accessor: "divisi", className: "font-medium" },
  { header: "Jumlah Karyawan", accessor: "jumlahKaryawan" },
  { header: "Total Gross", accessor: (r) => formatCurrency(r.totalGross), className: "text-right" },
  { header: "Total Net", accessor: (r) => formatCurrency(r.totalNet), className: "text-right font-bold" },
];

interface SalaryReportProps {
  data: SalaryReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function SalaryReport({ data, periodLabel, fileSuffix }: SalaryReportProps) {
  const { totals } = data;

  return (
    <div className="space-y-4">
      <ReportStatCards
        cards={[
          {
            label: "Total Gaji Bersih",
            value: formatCurrency(totals.totalNet),
            hint: `${totals.dibayar}/${totals.slip} slip dibayar`,
            tone: "purple",
          },
          { label: "Total Gaji Kotor", value: formatCurrency(totals.totalGross), hint: `Lembur ${formatCurrency(totals.totalLembur)}`, tone: "blue" },
          { label: "PPh 21 Dipotong", value: formatCurrency(totals.totalPph21), tone: "orange" },
          {
            label: "BPJS Perusahaan",
            value: formatCurrency(totals.totalBpjsPerusahaan),
            hint: `Iuran karyawan ${formatCurrency(totals.totalBpjsKaryawan)}`,
            tone: "green",
          },
        ]}
      />

      {totals.slip === 0 && (
        <p className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm rounded-xl px-4 py-3">
          Belum ada slip gaji untuk {periodLabel}. Hitung gaji terlebih dahulu di menu Payroll.
        </p>
      )}

      <ReportSection title="Tren Pengeluaran Gaji" subtitle="Total gaji bersih, 6 bulan terakhir">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1_000_000)} jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" name="Total Net" fill="#E02F75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Gaji per Divisi"
        subtitle={periodLabel}
        onExport={() => downloadCsv(`laporan-gaji-${fileSuffix}`, data.byDepartment, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.byDepartment} />
      </ReportSection>
    </div>
  );
}
