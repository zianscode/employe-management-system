"use client";

import React from "react";
import { formatCurrency } from "@/shared/utils/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export interface SalaryData {
  month: string;
  total: number;
}

export interface DeptData {
  name: string;
  count: number;
}

interface DashboardChartsProps {
  salaryData: SalaryData[];
  deptData: DeptData[];
}

export default function DashboardCharts({ salaryData, deptData }: DashboardChartsProps) {
  const COLORS = ["#E02F75", "#6700A3", "#FF5A57", "#00C49F", "#FFBB28"];

  return (
    <div className={`grid grid-cols-1 ${deptData.length > 0 ? "lg:grid-cols-2" : ""} gap-4`}>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              {deptData.length > 0 ? "Tren Pengeluaran Gaji" : "Tren Gaji Anda"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {deptData.length > 0 ? "Total pengeluaran bersih per bulan" : "Riwayat penghasilan bersih bulanan"}
            </p>
          </div>
          <div className="p-3 bg-pink-50 rounded-2xl text-[#E02F75]">
            <span className="text-xs font-bold uppercase tracking-widest">Live Data</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A57" />
                  <stop offset="100%" stopColor="#E02F75" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}jt`}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                formatter={(value: number) => [formatCurrency(value), 'Total Gaji']}
              />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {deptData.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Distribusi Karyawan</h3>
              <p className="text-sm text-gray-500 font-medium">Berdasarkan departemen aktif</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl text-[#6700A3]">
              <span className="text-xs font-bold uppercase tracking-widest">Enterprise</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}