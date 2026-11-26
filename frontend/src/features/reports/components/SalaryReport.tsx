"use client";

import React from "react";
import { Banknote, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryDepartmentRow, SalaryReportData } from "@/shared/types/report.types";
import { downloadReportCSV } from "@/lib/api/download";
import { formatCurrency } from "@/shared/utils/format";
import { useChartTheme } from "@/shared/hooks/use-chart-theme";
import { Alert } from "@/shared/components/ui/alert";
import { ReportStatCards } from "./ReportStatCards";
import { ReportSection } from "./ReportSection";

const TABLE_COLUMNS: {
  header: string;
  accessor: keyof SalaryDepartmentRow | ((r: SalaryDepartmentRow) => React.ReactNode);
  className?: string;
}[] = [
  { header: "Divisi", accessor: "divisi", className: "font-medium text-foreground" },
  { header: "Karyawan", accessor: "jumlahKaryawan", className: "tabular-nums" },
  { header: "Total kotor", accessor: (r) => formatCurrency(r.totalGross), className: "text-right tabular-nums" },
  { header: "Total bersih", accessor: (r) => formatCurrency(r.totalNet), className: "text-right font-medium tabular-nums text-foreground" },
];

interface SalaryReportProps {
  data: SalaryReportData;
  periodLabel: string;
  fileSuffix: string;
}

export function SalaryReport({ data, periodLabel, fileSuffix }: SalaryReportProps) {
  const chart = useChartTheme();
  const { totals } = data;

  return (
    <div className="space-y-6">
      <ReportStatCards
        cards={[
          { label: "Total gaji bersih", value: formatCurrency(totals.totalNet), hint: `${totals.dibayar} dari ${totals.slip} slip dibayar`, icon: Wallet },
          { label: "Total gaji kotor", value: formatCurrency(totals.totalGross), hint: `Lembur ${formatCurrency(totals.totalLembur)}`, icon: Banknote, tone: "info" },
          { label: "PPh 21 dipotong", value: formatCurrency(totals.totalPph21), icon: Receipt, tone: "warning" },
          {
            label: "BPJS perusahaan",
            value: formatCurrency(totals.totalBpjsPerusahaan),
            hint: `Iuran karyawan ${formatCurrency(totals.totalBpjsKaryawan)}`,
            icon: ShieldCheck,
            tone: "success",
          },
        ]}
      />

      {totals.slip === 0 && (
        <Alert variant="warning">Belum ada slip gaji untuk {periodLabel}. Hitung gaji dulu di menu Penggajian.</Alert>
      )}

      <ReportSection title="Tren pengeluaran gaji" subtitle="Total gaji bersih, 6 bulan terakhir">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.trend}>
              <CartesianGrid vertical={false} stroke={chart.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={chart.tick} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={chart.tick}
                tickFormatter={(v: number) => `${Math.round(v / 1_000_000)} jt`}
              />
              <Tooltip cursor={{ fill: chart.cursor }} contentStyle={chart.tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" name="Total bersih" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      <ReportSection
        title="Gaji per divisi"
        subtitle={periodLabel}
        flush
        onExport={() => downloadReportCSV("salary", fileSuffix)}
      >
        <DataTable columns={TABLE_COLUMNS} data={data.byDepartment} />
      </ReportSection>
    </div>
  );
}
