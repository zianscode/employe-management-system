import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryDepartmentRow, SalaryReportData } from "@/shared/types/report.types";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { formatCurrency } from "@/shared/utils/format";
import { BRAND_COLORS, CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from "@/shared/constants/theme";
import { Alert } from "@/shared/components/ui/Feedback";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const CSV_COLUMNS: CsvColumn<SalaryDepartmentRow>[] = [
  { header: "Divisi", value: (r) => r.divisi },
  { header: "Jumlah Karyawan", value: (r) => r.jumlahKaryawan },
  { header: "Total Gross", value: (r) => r.totalGross },
  { header: "Total Net", value: (r) => r.totalNet },
];

const TABLE_COLUMNS: {
  header: string;
  accessor: keyof SalaryDepartmentRow | ((r: SalaryDepartmentRow) => React.ReactNode);
  className?: string;
}[] = [
  { header: "Divisi", accessor: "divisi", className: "font-medium text-gray-900" },
  { header: "Karyawan", accessor: "jumlahKaryawan", className: "tabular-nums" },
  { header: "Total kotor", accessor: (r) => formatCurrency(r.totalGross), className: "text-right tabular-nums" },
  { header: "Total bersih", accessor: (r) => formatCurrency(r.totalNet), className: "text-right font-medium tabular-nums text-gray-900" },
];

interface SalaryReportProps {
  data: SalaryReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function SalaryReport({ data, periodLabel, fileSuffix }: SalaryReportProps) {
  const { totals } = data;

  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Total gaji bersih", value: formatCurrency(totals.totalNet), hint: `${totals.dibayar} dari ${totals.slip} slip dibayar` },
          { label: "Total gaji kotor", value: formatCurrency(totals.totalGross), hint: `Lembur ${formatCurrency(totals.totalLembur)}` },
          { label: "PPh 21 dipotong", value: formatCurrency(totals.totalPph21) },
          {
            label: "BPJS perusahaan",
            value: formatCurrency(totals.totalBpjsPerusahaan),
            hint: `Iuran karyawan ${formatCurrency(totals.totalBpjsKaryawan)}`,
          },
        ]}
      />

      {totals.slip === 0 && (
        <Alert tone="warning">Belum ada slip gaji untuk {periodLabel}. Hitung gaji dulu di menu Penggajian.</Alert>
      )}

      <ReportSection title="Tren pengeluaran gaji" subtitle="Total gaji bersih, 6 bulan terakhir">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={CHART_AXIS_TICK}
                tickFormatter={(v: number) => `${Math.round(v / 1_000_000)} jt`}
              />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" name="Total bersih" fill={BRAND_COLORS.brand} radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Gaji per divisi"
        subtitle={periodLabel}
        flush
        onExport={() => downloadCsv(`laporan-gaji-${fileSuffix}`, data.byDepartment, CSV_COLUMNS)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.byDepartment} />
      </ReportSection>
    </div>
  );
}
