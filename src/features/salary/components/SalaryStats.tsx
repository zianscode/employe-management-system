import React from "react";
import { formatCurrency } from "@/shared/utils/format";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";

interface SalaryStatsProps {
  stats: {
    totalSalary: number;
    basicSalary: number;
    totalAllowance: number;
    totalDeduction: number;
  };
}

export const SalaryStats: React.FC<SalaryStatsProps> = ({ stats }) => {
  return (
    <StatGrid>
      <StatCard label="Total gaji bersih" value={formatCurrency(stats.totalSalary)} />
      <StatCard label="Gaji pokok" value={formatCurrency(stats.basicSalary)} />
      <StatCard label="Tunjangan" value={formatCurrency(stats.totalAllowance)} />
      <StatCard label="Potongan" value={formatCurrency(stats.totalDeduction)} />
    </StatGrid>
  );
};
