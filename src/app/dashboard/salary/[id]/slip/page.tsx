import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSalarySlipAction } from "@/server/modules/salary/salary.actions";
import { PrintButton } from "@/features/salary/components/PrintButton";
import { SlipLine } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

function LineTable({ title, lines, total }: { title: string; lines: SlipLine[]; total?: number }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b border-gray-100">
              <td className="py-2 text-gray-700">{line.label}</td>
              <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(line.amount)}</td>
            </tr>
          ))}
          {total !== undefined && (
            <tr>
              <td className="py-2 font-bold text-gray-900">Total</td>
              <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(total)}</td>
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
    <div className="py-4 pl-8 pr-6 print:p-0">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/dashboard/salary" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#E02F75]">
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white max-w-3xl mx-auto rounded-2xl border border-gray-100 shadow-sm p-10 space-y-8 print:shadow-none print:border-0 print:rounded-none">
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{slip.companyName}</h1>
            {slip.companyNpwp && <p className="text-xs text-gray-500">NPWP {slip.companyNpwp}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#E02F75]">SLIP GAJI</p>
            <p className="text-sm text-gray-600">Periode {slip.periodLabel}</p>
            <p className="text-xs text-gray-500 mt-1">
              {slip.status === "Dibayar" ? `Dibayar ${slip.paidAt}` : "Belum dibayar"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {[
            ["Nama", slip.employee.name],
            ["NIP", slip.employee.nip],
            ["Jabatan", slip.employee.position],
            ["Divisi", slip.employee.department],
            ["Status PTKP", slip.employee.ptkp],
            ["NPWP/NIK", slip.employee.npwp || "-"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="w-28 text-gray-500">{label}</span>
              <span className="font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          <LineTable title="Pendapatan" lines={slip.earnings} total={slip.totalEarnings} />
          <LineTable title="Potongan" lines={slip.deductions} total={slip.totalDeductions} />
        </div>

        <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-6 py-4 print:bg-white print:text-black print:border print:border-gray-900">
          <span className="font-bold">Gaji Bersih Diterima</span>
          <span className="text-2xl font-black">{formatCurrency(slip.netPay)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          <LineTable title="Iuran Ditanggung Perusahaan" lines={slip.employerContributions} />
          <div className="text-xs text-gray-500 space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Keterangan Pajak</h3>
            <p>Penghasilan bruto PPh 21: <b className="text-gray-800">{formatCurrency(slip.taxableIncome)}</b></p>
            <p>Metode: <b className="text-gray-800">{slip.pph21Method || "-"}</b></p>
            <p>Bruto PPh 21 termasuk premi JKK, JKM, dan BPJS Kesehatan yang dibayar perusahaan.</p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">Dokumen ini dibuat otomatis oleh sistem dan sah tanpa tanda tangan.</p>
      </div>
    </div>
  );
}
