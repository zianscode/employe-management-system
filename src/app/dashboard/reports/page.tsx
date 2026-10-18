"use client";

import React from "react";
import Filter from "@/features/reports/components/Filter";
import { AttendanceReport } from "@/features/reports/components/AttendanceReport";
import { useReports } from "@/features/reports/hooks/use-reports";
import { Clock, DollarSign, Users, Calendar } from "lucide-react";
import { ReportTabId } from "@/shared/types/report.types";

export default function ReportsPage() {
  const {
    activeTab,
    setActiveTab,
    stats,
    attendanceData,
    attendancePieData,
    selectedMonth,
    setSelectedMonth,
  } = useReports();

  const categoryTabs = [
    { id: "absensi", label: "Absensi", icon: Clock },
    { id: "gaji", label: "Gaji", icon: DollarSign },
    { id: "karyawan", label: "Karyawan", icon: Users },
    { id: "cuti", label: "Cuti", icon: Calendar },
  ];

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Laporan & Analitik</h1>
        <p className="text-white/80 text-sm font-medium">Analisis mendalam performa dan kehadiran karyawan Anda secara real-time</p>
      </div>
      
      <div className="space-y-4 mt-4">
        <Filter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        <div className="flex overflow-x-auto gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md w-fit">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTabId)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-[#E02F75] shadow-lg border border-gray-100"
                    : "text-gray-500 hover:text-[#E02F75] hover:bg-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#E02F75]" : "text-gray-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-indigo-500/20`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <span className="text-green-500 text-sm font-bold">{stat.change}</span>
                </div>
                <h4 className="text-gray-500 text-sm font-medium">{stat.title}</h4>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {activeTab === "absensi" && (
          <AttendanceReport attendanceData={attendanceData} pieData={attendancePieData} />
        )}

        {activeTab !== "absensi" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Segera Hadir</h3>
            <p className="text-gray-500">Laporan {activeTab} sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
