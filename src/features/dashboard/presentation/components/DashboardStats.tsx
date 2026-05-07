import React from "react";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    { label: "Total Karyawan", value: "154", change: "+12%", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Hadir Hari Ini", value: "142", change: "+5%", icon: Clock, color: "bg-green-50 text-green-600" },
    { label: "Izin/Sakit", value: "8", change: "-2%", icon: Calendar, color: "bg-orange-50 text-orange-600" },
    { label: "Efisiensi Kerja", value: "94%", change: "+3%", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-125 duration-500 ${stat.color.split(" ")[0]}`}></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl shadow-inner ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                stat.change.startsWith("+") 
                  ? "bg-green-50 text-green-600" 
                  : "bg-red-50 text-red-600"
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
