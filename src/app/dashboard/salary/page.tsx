"use client";

import React from "react";
import { Search, Download, Filter, Calendar } from "lucide-react";
import { useSalary } from "@/features/salary/presentation/hooks/useSalary";
import { SalaryStats } from "@/features/salary/presentation/components/SalaryStats";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryRecord } from "@/features/salary/domain/entities/salary";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function SalaryPage() {
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
  } = useSalary();

  const columns = [
    { header: "NIP", accessor: "nip" as const, className: "font-medium" },
    { header: "Nama", accessor: "name" as const, className: "font-medium" },
    { header: "Jabatan", accessor: "position" as const },
    { header: "Gaji Pokok", accessor: (item: SalaryRecord) => formatCurrency(item.basicSalary), className: "text-right" },
    { header: "Tunjangan", accessor: (item: SalaryRecord) => formatCurrency(item.allowance), className: "text-right" },
    { header: "Potongan", accessor: (item: SalaryRecord) => formatCurrency(item.deduction), className: "text-right" },
    { header: "Total Gaji", accessor: (item: SalaryRecord) => formatCurrency(item.totalSalary), className: "text-right font-bold" },
    {
      header: "Status",
      accessor: (item: SalaryRecord) => (
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

  return (
    <div className="py-4 pl-8 pr-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Manajemen Gaji</h1>
            <p className="text-white/80 text-sm">Kelola dan pantau penggajian karyawan</p>
          </div>
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 border border-white/20">
            <Download size={16} />
            Export Payroll
          </button>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <SalaryStats stats={stats} />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Data Penggajian</h2>
                <p className="text-gray-600">Data gaji karyawan untuk periode {selectedMonth}</p>
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
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option>January 2024</option>
                    <option>February 2024</option>
                    <option>March 2024</option>
                  </select>
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
              <div className="flex items-center gap-2">
                <span>Total karyawan:</span>
                <span className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] bg-clip-text text-transparent font-bold">
                  {totalCount} orang
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}