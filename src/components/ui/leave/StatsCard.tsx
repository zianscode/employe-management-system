import React from "react";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      label: "Pending",
      value: 2,
      color: "from-yellow-400 to-yellow-600",
      icon: Clock,
    },
    {
      label: "Disetujui",
      value: 2,
      color: "from-green-400 to-green-600",
      icon: CheckCircle,
    },
    {
      label: "Ditolak",
      value: 1,
      color: "from-red-400 to-red-600",
      icon: XCircle,
    },
    {
      label: "Total Hari",
      value: 93,
      color: "from-blue-400 to-blue-600",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}
                >
                  <IconComponent className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
