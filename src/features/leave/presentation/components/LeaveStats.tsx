import React from "react";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

const LeaveStats = () => {
  const stats = [
    { label: "Total Permohonan", value: "24", change: "+5", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Disetujui", value: "18", change: "+3", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Pending", value: "4", change: "-2", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "Ditolak", value: "2", change: "0", icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
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

export default LeaveStats;
