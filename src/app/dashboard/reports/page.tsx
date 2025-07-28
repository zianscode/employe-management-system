"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Header from "@/components/ui/dashboard/Header";
import Filter from "@/components/ui/reports/Filter";

export default function ReportsPage() {


  // Data for Absensi tab
  const attendanceData = [
    { month: "Jan", kehadiran: 92, izin: 5, sakit: 2, alpha: 1 },
    { month: "Feb", kehadiran: 88, izin: 8, sakit: 3, alpha: 1 },
    { month: "Mar", kehadiran: 95, izin: 3, sakit: 1, alpha: 1 },
    { month: "Apr", kehadiran: 90, izin: 6, sakit: 3, alpha: 1 },
    { month: "May", kehadiran: 93, izin: 4, sakit: 2, alpha: 1 },
    { month: "Jun", kehadiran: 91, izin: 5, sakit: 3, alpha: 1 },
  ];

  const attendancePieData = [
    { name: "Hadir", value: 91.3, color: "#10B981" },
    { name: "Izin", value: 5.2, color: "#3B82F6" },
    { name: "Sakit", value: 2.8, color: "#F59E0B" },
    { name: "Alpha", value: 0.7, color: "#EF4444" },
  ];

  // Data for Gaji tab
  const salaryData = [
    { month: "Jan", totalGaji: 900000000, rataRata: 9000000, bonus: 50000000 },
    { month: "Feb", totalGaji: 920000000, rataRata: 9200000, bonus: 45000000 },
    { month: "Mar", totalGaji: 880000000, rataRata: 8800000, bonus: 60000000 },
    { month: "Apr", totalGaji: 950000000, rataRata: 9500000, bonus: 55000000 },
    { month: "May", totalGaji: 910000000, rataRata: 9100000, bonus: 48000000 },
    { month: "Jun", totalGaji: 890000000, rataRata: 8900000, bonus: 52000000 },
  ];

  const salaryDistributionData = [
    { divisi: "Operations", rataRataGaji: 11500000 },
    { divisi: "IT", rataRataGaji: 10800000 },
    { divisi: "Sales", rataRataGaji: 9500000 },
    { divisi: "HR", rataRataGaji: 9200000 },
    { divisi: "Finance", rataRataGaji: 8800000 },
    { divisi: "Marketing", rataRataGaji: 8500000 },
  ];

  // Data for Karyawan tab
  const employeeData = [
    { divisi: "IT", jumlah: 45, persentase: 18.2 },
    { divisi: "HR", jumlah: 25, persentase: 10.1 },
    { divisi: "Finance", jumlah: 35, persentase: 14.2 },
    { divisi: "Marketing", jumlah: 40, persentase: 16.2 },
    { divisi: "Operations", jumlah: 55, persentase: 22.3 },
    { divisi: "Sales", jumlah: 48, persentase: 19.4 },
  ];

  const employeePieData = [
    { name: "IT", value: 18.2, color: "#3B82F6" },
    { name: "HR", value: 10.1, color: "#10B981" },
    { name: "Finance", value: 14.2, color: "#F59E0B" },
    { name: "Marketing", value: 16.2, color: "#EF4444" },
    { name: "Operations", value: 22.3, color: "#8B5CF6" },
    { name: "Sales", value: 19.4, color: "#06B6D4" },
  ];

  // Data for Cuti tab
  const leaveData = [
    {
      divisi: "IT",
      disetujui: 12,
      pending: 3,
      ditolak: 1,
      total: 16,
      tingkatPersetujuan: 75.0,
    },
    {
      divisi: "HR",
      disetujui: 8,
      pending: 2,
      ditolak: 0,
      total: 10,
      tingkatPersetujuan: 80.0,
    },
    {
      divisi: "Finance",
      disetujui: 10,
      pending: 1,
      ditolak: 1,
      total: 12,
      tingkatPersetujuan: 83.3,
    },
    {
      divisi: "Marketing",
      disetujui: 15,
      pending: 4,
      ditolak: 2,
      total: 21,
      tingkatPersetujuan: 71.4,
    },
    {
      divisi: "Operations",
      disetujui: 18,
      pending: 5,
      ditolak: 1,
      total: 24,
      tingkatPersetujuan: 75.0,
    },
    {
      divisi: "Sales",
      disetujui: 14,
      pending: 3,
      ditolak: 1,
      total: 18,
      tingkatPersetujuan: 77.8,
    },
  ];

  const leaveStatusData = [
    { month: "Jan", disetujui: 15, pending: 3, ditolak: 1 },
    { month: "Feb", disetujui: 12, pending: 4, ditolak: 2 },
    { month: "Mar", disetujui: 18, pending: 2, ditolak: 0 },
    { month: "Apr", disetujui: 14, pending: 5, ditolak: 1 },
    { month: "May", disetujui: 16, pending: 3, ditolak: 1 },
    { month: "Jun", disetujui: 13, pending: 4, ditolak: 1 },
  ];

  const categoryTabs = [
    { id: "absensi", label: "Absensi", icon: Clock },
    { id: "gaji", label: "Gaji", icon: DollarSign },
    { id: "karyawan", label: "Karyawan", icon: Users },
    { id: "cuti", label: "Cuti", icon: Calendar },
  ];

  const [activeTab, setActiveTab] = useState("absensi");

  // Stats based on active tab
  const getStatsForTab = () => {
    switch (activeTab) {
      case "absensi":
        return [
          {
            title: "Rata-rata Kehadiran",
            value: "91.3%",
            change: "+2.1%",
            icon: TrendingUp,
            color: "from-green-400 to-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Total Izin",
            value: "35",
            change: "-5",
            icon: Calendar,
            color: "from-blue-400 to-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Total Sakit",
            value: "12",
            change: "+3",
            icon: Clock,
            color: "from-orange-400 to-orange-600",
            bgColor: "bg-orange-50",
          },
          {
            title: "Total Alpha",
            value: "3",
            change: "-1",
            icon: Users,
            color: "from-red-400 to-red-600",
            bgColor: "bg-red-50",
          },
        ];
      case "gaji":
        return [
          {
            title: "Total Pengeluaran Gaji",
            value: "Rp 5.4M",
            change: "+8.5%",
            icon: DollarSign,
            color: "from-blue-400 to-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Rata-rata Gaji",
            value: "Rp 9.0M",
            change: "+5.2%",
            icon: TrendingUp,
            color: "from-green-400 to-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Kenaikan YoY",
            value: "+8.5%",
            change: "+2.1%",
            icon: BarChart3,
            color: "from-purple-400 to-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Total Bonus",
            value: "Rp 310M",
            change: "+12%",
            icon: DollarSign,
            color: "from-orange-400 to-orange-600",
            bgColor: "bg-orange-50",
          },
        ];
      case "karyawan":
        return [
          {
            title: "Total Karyawan",
            value: "248",
            change: "+12",
            icon: Users,
            color: "from-blue-400 to-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Karyawan Aktif",
            value: "235",
            change: "+8",
            icon: TrendingUp,
            color: "from-green-400 to-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Karyawan Baru",
            value: "15",
            change: "+5",
            icon: Users,
            color: "from-purple-400 to-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Turnover Rate",
            value: "5.2%",
            change: "-1.1%",
            icon: BarChart3,
            color: "from-orange-400 to-orange-600",
            bgColor: "bg-orange-50",
          },
        ];
      case "cuti":
        return [
          {
            title: "Total Permohonan",
            value: "101",
            change: "+8",
            icon: Calendar,
            color: "from-blue-400 to-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Disetujui",
            value: "77",
            change: "+6",
            icon: TrendingUp,
            color: "from-green-400 to-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Pending",
            value: "18",
            change: "+2",
            icon: Clock,
            color: "from-orange-400 to-orange-600",
            bgColor: "bg-orange-50",
          },
          {
            title: "Ditolak",
            value: "6",
            change: "0",
            icon: Users,
            color: "from-red-400 to-red-600",
            bgColor: "bg-red-50",
          },
        ];
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "absensi":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Tren Kehadiran 6 Bulan Terakhir
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Persentase kehadiran, izin, sakit, dan alpha per bulan
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="kehadiran"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="izin" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sakit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="alpha" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Distribusi Kehadiran
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Persentase keseluruhan periode
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendancePieData}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        className="focus:outline-none"
                      >
                        {attendancePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Persentase"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {attendancePieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {item.value.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "gaji":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Salary Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Tren Penggajian 6 Bulan Terakhir
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Total pengeluaran gaji dan rata-rata gaji per bulan
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryData}>
                    <defs>
                      <linearGradient id="colorTotalGaji" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `Rp${value / 1000000}M`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [`Rp ${(value / 1000000).toFixed(1)} Juta`, name]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalGaji"
                      stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotalGaji)"
                      strokeWidth={3}
                      name="Total Gaji"
                    />
                    <Area
                      type="monotone"
                      dataKey="bonus"
                      stroke="#10B981" fillOpacity={1} fill="url(#colorBonus)"
                      strokeWidth={3}
                      name="Bonus"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Salary Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Distribusi Gaji per Divisi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Rata-rata gaji berdasarkan divisi
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `Rp${value / 1000000} Jt`} />
                    <YAxis dataKey="divisi" type="category" stroke="#6b7280" width={80} />
                    <Tooltip
                      formatter={(value: number) => [
                        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value),
                        "Rata-rata Gaji"
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="rataRataGaji" name="Rata-rata Gaji" radius={[0, 8, 8, 0]}>
                      {salaryDistributionData.map((entry, index) => {
                        const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "karyawan":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Employee Distribution Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Distribusi Karyawan per Divisi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Jumlah dan persentase karyawan di setiap divisi
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={employeePieData}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {employeePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Persentase"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {employeeData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: employeePieData[index].color,
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.divisi}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {item.jumlah}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.persentase.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Details Table - Full Width */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Data Karyawan Detail
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Informasi lengkap karyawan dan performa
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Divisi
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Jumlah
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Persentase
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Aktif
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: employeePieData[index].color,
                              }}
                            ></div>
                            <span className="font-medium text-gray-800">
                              {item.divisi}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-semibold text-gray-800">
                          {item.jumlah}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {item.persentase}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {Math.floor(item.jumlah * 0.95)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Stabil
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "cuti":
        return (
          <div className="space-y-6">
            {/* Leave Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tren Permohonan Cuti 6 Bulan
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Status permohonan cuti per bulan
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="disetujui"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        name="Disetujui"
                      />
                      <Bar
                        dataKey="pending"
                        fill="#F59E0B"
                        radius={[4, 4, 0, 0]}
                        name="Pending"
                      />
                      <Bar
                        dataKey="ditolak"
                        fill="#EF4444"
                        radius={[4, 4, 0, 0]}
                        name="Ditolak"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Grafik Permohonan Cuti per Divisi
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Tingkat persetujuan per divisi
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis
                        dataKey="divisi"
                        type="category"
                        stroke="#6b7280"
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="tingkatPersetujuan"
                        fill="#10B981"
                        radius={[0, 4, 4, 0]}
                        name="Tingkat Persetujuan (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Leave Details Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Detail Permohonan Cuti per Divisi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Rincian status permohonan cuti untuk setiap divisi
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Divisi
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Disetujui
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Pending
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Ditolak
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Total Permohonan
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Tingkat Persetujuan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {item.divisi}
                        </td>
                        <td className="text-center py-3 px-4 text-green-600 font-semibold">
                          {item.disetujui}
                        </td>
                        <td className="text-center py-3 px-4 text-yellow-600 font-semibold">
                          {item.pending}
                        </td>
                        <td className="text-center py-3 px-4 text-red-600 font-semibold">
                          {item.ditolak}
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-gray-800">
                          {item.total}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {item.tingkatPersetujuan.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      {/* Header */}
      <Header />

      <div className="py-6">
        {/* Filter Section */}
        <Filter/>

        {/* Category Tabs */}
        <div className="mb-5">
          <div className="flex space-x-4 border-gray-200">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsForTab().map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${stat.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} dari periode sebelumnya
                </p>
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
