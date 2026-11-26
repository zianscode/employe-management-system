"use client";

import React from "react";
import { formatCurrency } from "@/shared/utils/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useChartTheme } from "@/shared/hooks/use-chart-theme";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { EmptyState } from "@/shared/components/EmptyState";

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
  const chart = useChartTheme();
  const isOrganizational = deptData.length > 0;
  const totalEmployees = deptData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={`grid grid-cols-1 gap-6 ${isOrganizational ? "lg:grid-cols-3" : ""}`}>
      <Card className={isOrganizational ? "lg:col-span-2" : ""}>
        <CardHeading
          title={isOrganizational ? "Pengeluaran gaji" : "Riwayat gaji"}
          description={isOrganizational ? "Total gaji bersih per bulan" : "Gaji bersih per bulan"}
        />
        <CardContent>
          {salaryData.length === 0 ? (
            <EmptyState title="Belum ada data gaji" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ left: -8 }}>
                  <CartesianGrid vertical={false} stroke={chart.grid} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={chart.tick} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chart.tick}
                    tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} jt`}
                  />
                  <Tooltip
                    cursor={{ fill: chart.cursor }}
                    contentStyle={chart.tooltipStyle}
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                  />
                  <Bar dataKey="total" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {isOrganizational && (
        <Card>
          <CardHeading title="Karyawan per divisi" description={`${totalEmployees} karyawan`} />
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={1} stroke="none">
                    {deptData.map((entry, index) => (
                      <Cell key={entry.name} fill={chart.palette[index % chart.palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chart.tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2">
              {deptData.map((dept, index) => (
                <li key={dept.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chart.palette[index % chart.palette.length] }} />
                    {dept.name}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">{dept.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
