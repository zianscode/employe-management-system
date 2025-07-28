import React from 'react';
import { TrendingUp, TrendingDown, Users, UserCheck, Clock, Building } from 'lucide-react';

export default function StatsCards() {

   const stats = [
    {
      title: "Total Karyawan",
      value: "248",
      change: "+12%",
      changeType: "increase",
      icon: <Users className="w-6 h-6" />,
      color: "from-[#FF5A57] to-[#E02F75]"
    },
    {
      title: "Karyawan Aktif", 
      value: "235",
      change: "+5%",
      changeType: "increase",
      icon: <UserCheck className="w-6 h-6" />,
      color: "from-[#E02F75] to-[#6700A3]"
    },
    {
      title: "Cuti Pending",
      value: "18", 
      change: "-3%",
      changeType: "decrease",
      icon: <Clock className="w-6 h-6" />,
      color: "from-[#6700A3] to-[#050C38]"
    },
    {
      title: "Total Divisi",
      value: "8",
      change: "0%", 
      changeType: "neutral",
      icon: <Building className="w-6 h-6" />,
      color: "from-[#050C38] to-[#6700A3]"
    }
  ];

   
  return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.changeType === 'increase' && <TrendingUp className="w-4 h-4 mr-1" />}
                  {stat.changeType === 'decrease' && <TrendingDown className="w-4 h-4 mr-1" />}
                  {stat.change} dari bulan lalu
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
  )
}
