import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSalarySlip } from "@/lib/api/server";
import { PrintButton } from "@/features/salary/components/PrintButton";
import { SlipLine } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";
import { Page } from "@/shared/components/PageLayout";

interface PageProps {
  params: Promise<{ id: string }>;
}

function LineTable({ title, lines, total }: { title: string; lines: SlipLine[]; total?: number }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b border-border">
              <td className="py-2 text-muted-foreground">{line.label}</td>
              <td className="py-2 text-right tabular-nums text-foreground">{formatCurrency(line.amount)}</td>
            </tr>
          ))}
          {total !== undefined && (
            <tr>
              <td className="pt-2 font-medium text-foreground">Total</td>
              <td className="pt-2 text-right font-medium tabular-nums text-foreground">{formatCurrency(total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function SalarySlipPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getSalarySlip(id);
  if (!res.success || !res.data) notFound();
  const slip = res.data;

  return (
    <Page className="max-w-4xl print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/salary" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Penggajian
        </Link>
        <PrintButton />
      </div>

      <div className="space-y-8 rounded-lg border border-border bg-card p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{slip.companyName}</h1>
            {slip.companyNpwp && <p className="text-sm text-muted-foreground">NPWP {slip.companyNpwp}</p>}
          </div>
          <div className="text-right">
            <p className="text-base font-semibold text-foreground">Slip Gaji</p>
            <p className="text-sm text-muted-foreground">{slip.periodLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">{slip.status === "Dibayar" ? `Dibayar ${slip.paidAt}` : "Belum dibayar"}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 print:grid-cols-2">
          {[
            ["Nama", slip.employee.name],
            ["NIP", slip.employee.nip],
            ["Jabatan", slip.employee.position],
            ["Divisi", slip.employee.department],
            ["Status PTKP", slip.employee.ptkp],
            ["NPWP/NIK", slip.employee.npwp || "-"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2">
          <LineTable title="Pendapatan" lines={slip.earnings} total={slip.totalEarnings} />
          <LineTable title="Potongan" lines={slip.deductions} total={slip.totalDeductions} />
        </div>

        <div className="flex items-center justify-between rounded-md border border-input bg-muted/50 px-5 py-4 print:bg-white">
          <span className="text-sm font-medium text-foreground">Gaji bersih diterima</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">{formatCurrency(slip.netPay)}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2">
          <LineTable title="Iuran ditanggung perusahaan" lines={slip.employerContributions} />
          <div className="space-y-1 text-sm text-muted-foreground">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Keterangan pajak</h3>
            <p>
              Penghasilan bruto PPh 21: <span className="tabular-nums text-foreground">{formatCurrency(slip.taxableIncome)}</span>
            </p>
            <p>
              Metode: <span className="text-foreground">{slip.pph21Method || "-"}</span>
            </p>
            <p className="text-xs text-muted-foreground">Bruto PPh 21 termasuk premi JKK, JKM, dan BPJS Kesehatan yang dibayar perusahaan.</p>
          </div>
        </div>

        <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground/70">
          Dokumen ini dibuat oleh sistem dan sah tanpa tanda tangan.
        </p>
      </div>
    </Page>
  );
}
