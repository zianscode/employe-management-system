import React from "react";
import { Users, Clock, UserCheck, UserMinus } from "lucide-react";

const AttendanceStats = () => {
  const stats = [
    { label: "Total Karyawan", value: "154", change: "+12", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Hadir", value: "142", change: "+5", icon: UserCheck, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Terlambat", value: "8", change: "-2", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "Tidak Hadir", value: "4", change: "-1", icon: UserMinus, color: "text-red-600", bgColor: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <span className="text-green-500 text-sm font-bold">{stat.change}</span>
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
