"use client";

import React from "react";
import { Users, Clock, Calendar, TrendingUp, Briefcase, CreditCard } from "lucide-react";

export interface PersonalStats {
  attendanceStatus: string;
  checkInTime: Date | string | null;
  remainingLeave: number;
  totalSalaryReceived: number;
}

export interface OrganizationalStats {
  totalEmployees: number;
  presentToday: number;
  leaveRequests: number;
  efficiency: number;
}

export interface DashboardData {
  type: "PERSONAL" | "ORGANIZATIONAL";
  stats: PersonalStats | OrganizationalStats;
}

interface DashboardStatsProps {
  data: DashboardData | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  if (!data) return null;

  if (!data) return null;

  const isPersonal = data.type === "PERSONAL";
  
  const stats = isPersonal ? [
    { label: "Status Absensi", value: (data.stats as PersonalStats).attendanceStatus, icon: Clock, color: "bg-blue-50 text-blue-600", gradient: "from-blue-500/20 to-blue-600/20" },
    { label: "Sisa Cuti", value: `${(data.stats as PersonalStats).remainingLeave} Hari`, icon: Calendar, color: "bg-green-50 text-green-600", gradient: "from-green-500/20 to-green-600/20" },
    { label: "Gaji Dibayar", value: `${(data.stats as PersonalStats).totalSalaryReceived} Bulan`, icon: CreditCard, color: "bg-purple-50 text-purple-600", gradient: "from-purple-500/20 to-purple-600/20" },
    { label: "Proyek Aktif", value: "3", icon: Briefcase, color: "bg-orange-50 text-orange-600", gradient: "from-orange-500/20 to-orange-600/20" },
  ] : [
    { label: "Total Karyawan", value: (data.stats as OrganizationalStats).totalEmployees.toString(), icon: Users, color: "bg-blue-50 text-blue-600", gradient: "from-blue-500/20 to-blue-600/20" },
    { label: "Hadir Hari Ini", value: (data.stats as OrganizationalStats).presentToday.toString(), icon: Clock, color: "bg-green-50 text-green-600", gradient: "from-green-500/20 to-green-600/20" },
    { label: "Permintaan Cuti", value: (data.stats as OrganizationalStats).leaveRequests.toString(), icon: Calendar, color: "bg-orange-50 text-orange-600", gradient: "from-orange-500/20 to-orange-600/20" },
    { label: "Efisiensi Kerja", value: `${(data.stats as OrganizationalStats).efficiency}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600", gradient: "from-purple-500/20 to-purple-600/20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10`}>
                <Icon size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Realtime</span>
                <div className="h-1 w-8 bg-gray-100 rounded-2xl mt-1 overflow-hidden">
                   <div className={`h-full ${stat.color.split(" ")[1].replace('text', 'bg')}`}></div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
