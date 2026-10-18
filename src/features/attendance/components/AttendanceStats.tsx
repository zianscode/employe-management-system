"use client";

import React from "react";
import { Users, Clock, UserCheck, UserMinus } from "lucide-react";


export interface StatData {
  label: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger" | "neutral";
}

interface AttendanceStatsProps {
  stats: StatData[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const getIcon = (label: string) => {
    switch (label) {
      case "Total Karyawan": return Users;
      case "Hadir": return UserCheck;
      case "Terlambat": return Clock;
      case "Tidak Hadir": return UserMinus;
      default: return Users;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600 bg-green-50";
      case "warning": return "text-orange-600 bg-orange-50";
      case "danger": return "text-red-600 bg-red-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = getIcon(stat.label);
        const colorClasses = getColor(stat.type);
        return (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colorClasses}`}>
                <Icon size={24} />
              </div>
              <span className={`text-sm font-bold ${stat.type === 'danger' ? 'text-red-500' : 'text-green-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStats;
