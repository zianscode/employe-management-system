import React from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AttendanceTrend, AttendanceDistribution } from "@/shared/types/report.types";

interface AttendanceReportProps {
  attendanceData: AttendanceTrend[];
  pieData: AttendanceDistribution[];
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  attendanceData,
  pieData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tren Kehadiran</h3>
            <p className="text-gray-600 text-sm">6 Bulan Terakhir</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Download className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="kehadiran" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sakit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alpha" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Distribusi Kehadiran</h3>
            <p className="text-gray-600 text-sm">Persentase keseluruhan</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-72 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-800">
              {pieData.find(d => d.name === "Hadir")?.value || 0}%
            </span>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Hadir</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex justify-between w-full pr-2">
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                <span className="text-sm font-bold text-gray-800">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
