"use client";

import React from "react";
import { formatCurrency } from "@/shared/utils/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BRAND_COLORS, CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_TICK } from "@/shared/constants/theme";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/Feedback";

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
  const isOrganizational = deptData.length > 0;
  const totalEmployees = deptData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={`grid grid-cols-1 gap-6 ${isOrganizational ? "lg:grid-cols-3" : ""}`}>
      <Card className={isOrganizational ? "lg:col-span-2" : ""}>
        <CardHeader
          title={isOrganizational ? "Pengeluaran gaji" : "Riwayat gaji"}
          description={isOrganizational ? "Total gaji bersih per bulan" : "Gaji bersih per bulan"}
        />
        <CardBody>
          {salaryData.length === 0 ? (
            <EmptyState title="Belum ada data gaji" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ left: -8 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={CHART_AXIS_TICK}
                    tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} jt`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                  />
                  <Bar dataKey="total" fill={BRAND_COLORS.brand} radius={[3, 3, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {isOrganizational && (
        <Card>
          <CardHeader title="Karyawan per divisi" description={`${totalEmployees} karyawan`} />
          <CardBody>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={1} stroke="none">
                    {deptData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2">
              {deptData.map((dept, index) => (
                <li key={dept.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    {dept.name}
                  </span>
                  <span className="font-medium tabular-nums text-gray-900">{dept.count}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
