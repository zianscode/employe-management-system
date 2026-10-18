"use client";

import React, { useState } from "react";
import { Search, Filter, Calendar, Calculator, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSalary } from "@/features/salary/hooks/use-salary";
import { SalaryStats } from "@/features/salary/components/SalaryStats";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryRecord } from "@/shared/types/salary.types";
import { isAdminRole } from "@/shared/constants/roles";
import { formatCurrency } from "@/shared/utils/format";
import { generatePayrollAction, markSalaryPaidAction } from "@/server/modules/salary/salary.actions";

export default function SalaryPage() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    totalCount,
    filteredCount,
    refresh,
  } = useSalary();

  const [year, month] = selectedMonth.split("-").map(Number);
  const periodLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const run = async (action: () => Promise<{ success: boolean; message: string }>) => {
    setIsProcessing(true);
    const res = await action();
    if (res.success) {
      toast.success(res.message);
      await refresh();
    } else {
      toast.error(res.message);
    }
    setIsProcessing(false);
  };

  const columns: { header: string; accessor: keyof SalaryRecord | ((item: SalaryRecord) => React.ReactNode); className?: string }[] = [
    { header: "NIP", accessor: "nip", className: "font-medium" },
    { header: "Nama", accessor: "name", className: "font-medium" },
    { header: "Jabatan", accessor: "position" },
    { header: "Gaji Pokok", accessor: (item) => formatCurrency(item.basicSalary), className: "text-right" },
    { header: "Tunjangan", accessor: (item) => formatCurrency(item.allowance), className: "text-right" },
    { header: "Lembur", accessor: (item) => formatCurrency(item.overtimePay), className: "text-right" },
    { header: "Potongan", accessor: (item) => formatCurrency(item.deduction), className: "text-right" },
    { header: "Total Gaji", accessor: (item) => formatCurrency(item.totalSalary), className: "text-right font-bold" },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "Dibayar" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.status}
        </span>
      ),
      className: "text-center",
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Aksi",
      accessor: (item) =>
        item.status === "Pending" ? (
          <button
            onClick={() => run(() => markSalaryPaidAction(item.id))}
            disabled={isProcessing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            Tandai Dibayar
          </button>
        ) : null,
    });
  }

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{isAdmin ? "Manajemen Gaji" : "Slip Gaji Saya"}</h1>
            <p className="text-white/80 text-sm">
              {isAdmin ? "Hitung, kelola, dan pantau penggajian karyawan" : "Riwayat gaji Anda per periode"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => run(() => generatePayrollAction(month, year))}
              disabled={isProcessing}
              className="bg-white text-[#E02F75] hover:bg-gray-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Calculator size={16} />
              {isProcessing ? "Memproses..." : `Hitung Gaji ${periodLabel}`}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <SalaryStats stats={stats} />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Data Penggajian</h2>
                <p className="text-gray-600">Periode {periodLabel}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none w-full sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none bg-white cursor-pointer"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option>Semua Status</option>
                    <option>Dibayar</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DataTable columns={columns} data={data} />

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Menampilkan {filteredCount} dari {totalCount} data</span>
              {isAdmin && totalCount === 0 && (
                <span>Belum ada data. Klik &quot;Hitung Gaji&quot; untuk membuat slip periode ini.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
