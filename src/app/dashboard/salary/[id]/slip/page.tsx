import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSalarySlipAction } from "@/server/modules/salary/salary.actions";
import { PrintButton } from "@/features/salary/components/PrintButton";
import { SlipLine } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";
import { Page } from "@/shared/components/ui/Page";

interface PageProps {
  params: Promise<{ id: string }>;
}

function LineTable({ title, lines, total }: { title: string; lines: SlipLine[]; total?: number }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b border-gray-100">
              <td className="py-2 text-gray-600">{line.label}</td>
              <td className="py-2 text-right tabular-nums text-gray-900">{formatCurrency(line.amount)}</td>
            </tr>
          ))}
          {total !== undefined && (
            <tr>
              <td className="pt-2 font-medium text-gray-900">Total</td>
              <td className="pt-2 text-right font-medium tabular-nums text-gray-900">{formatCurrency(total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function SalarySlipPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getSalarySlipAction(id);
  if (!res.success || !res.data) notFound();
  const slip = res.data;

  return (
    <Page className="max-w-4xl print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/salary" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Penggajian
        </Link>
        <PrintButton />
      </div>

      <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{slip.companyName}</h1>
            {slip.companyNpwp && <p className="text-sm text-gray-500">NPWP {slip.companyNpwp}</p>}
          </div>
          <div className="text-right">
            <p className="text-base font-semibold text-gray-900">Slip Gaji</p>
            <p className="text-sm text-gray-600">{slip.periodLabel}</p>
            <p className="mt-1 text-xs text-gray-500">{slip.status === "Dibayar" ? `Dibayar ${slip.paidAt}` : "Belum dibayar"}</p>
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
              <dt className="w-28 shrink-0 text-gray-500">{label}</dt>
              <dd className="text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2">
          <LineTable title="Pendapatan" lines={slip.earnings} total={slip.totalEarnings} />
          <LineTable title="Potongan" lines={slip.deductions} total={slip.totalDeductions} />
        </div>

        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-5 py-4 print:bg-white">
          <span className="text-sm font-medium text-gray-900">Gaji bersih diterima</span>
          <span className="text-xl font-semibold tabular-nums text-gray-900">{formatCurrency(slip.netPay)}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2">
          <LineTable title="Iuran ditanggung perusahaan" lines={slip.employerContributions} />
          <div className="space-y-1 text-sm text-gray-600">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Keterangan pajak</h3>
            <p>
              Penghasilan bruto PPh 21: <span className="tabular-nums text-gray-900">{formatCurrency(slip.taxableIncome)}</span>
            </p>
            <p>
              Metode: <span className="text-gray-900">{slip.pph21Method || "-"}</span>
            </p>
            <p className="text-xs text-gray-500">Bruto PPh 21 termasuk premi JKK, JKM, dan BPJS Kesehatan yang dibayar perusahaan.</p>
          </div>
        </div>

        <p className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          Dokumen ini dibuat oleh sistem dan sah tanpa tanda tangan.
        </p>
      </div>
    </Page>
  );
}
