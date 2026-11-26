import React from "react";
import { formatCurrency } from "@/shared/utils/format";
import { BadgeMinus, BadgePlus, Banknote, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/StatCard";

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
      <StatCard label="Total gaji bersih" value={formatCurrency(stats.totalSalary)} icon={Wallet} />
      <StatCard label="Gaji pokok" value={formatCurrency(stats.basicSalary)} icon={Banknote} tone="info" />
      <StatCard label="Tunjangan" value={formatCurrency(stats.totalAllowance)} icon={BadgePlus} tone="success" />
      <StatCard label="Potongan" value={formatCurrency(stats.totalDeduction)} icon={BadgeMinus} tone="destructive" />
    </StatGrid>
  );
};
