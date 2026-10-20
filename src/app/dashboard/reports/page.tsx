"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Clock, DollarSign, Users, Calendar } from "lucide-react";
import Filter from "@/features/reports/components/Filter";
import { AttendanceReport } from "@/features/reports/components/AttendanceReport";
import { SalaryReport } from "@/features/reports/components/SalaryReport";
import { EmployeeReport } from "@/features/reports/components/EmployeeReport";
import { LeaveReport } from "@/features/reports/components/LeaveReport";
import { useReports } from "@/features/reports/hooks/use-reports";
import { ReportTabId } from "@/shared/types/report.types";
import { isAdminRole } from "@/shared/constants/roles";

const TABS: { id: ReportTabId; label: string; icon: React.ElementType; adminOnly: boolean }[] = [
  { id: "absensi", label: "Absensi", icon: Clock, adminOnly: false },
  { id: "gaji", label: "Gaji", icon: DollarSign, adminOnly: true },
  { id: "karyawan", label: "Karyawan", icon: Users, adminOnly: false },
  { id: "cuti", label: "Cuti", icon: Calendar, adminOnly: false },
];

export default function ReportsPage() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const { activeTab, setActiveTab, selectedMonth, setSelectedMonth, report, isLoading, periodLabel, fileSuffix } = useReports();

  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);
  const reportProps = { periodLabel, fileSuffix };

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Laporan & Analitik</h1>
        <p className="text-white/80 text-sm font-medium">
          {isAdmin ? "Rekap absensi, gaji, karyawan, dan cuti seluruh perusahaan" : "Rekap absensi, karyawan, dan cuti tim Anda"}
        </p>
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex overflow-x-auto gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive ? "bg-white text-[#E02F75] shadow-lg border border-gray-100" : "text-gray-500 hover:text-[#E02F75] hover:bg-white"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-[#E02F75]" : "text-gray-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <Filter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </div>

        {isLoading && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E02F75] mx-auto mb-4"></div>
            <p className="text-gray-500">Menyusun laporan...</p>
          </div>
        )}

        {!isLoading && report?.tab === "absensi" && <AttendanceReport data={report.data} {...reportProps} />}
        {!isLoading && report?.tab === "gaji" && <SalaryReport data={report.data} {...reportProps} />}
        {!isLoading && report?.tab === "karyawan" && <EmployeeReport data={report.data} {...reportProps} />}
        {!isLoading && report?.tab === "cuti" && <LeaveReport data={report.data} {...reportProps} />}
      </div>
    </div>
  );
}
