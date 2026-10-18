import React from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface SalaryStatsProps {
  stats: {
    totalSalary: number;
    basicSalary: number;
    totalAllowance: number;
    totalDeduction: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const SalaryStats: React.FC<SalaryStatsProps> = ({ stats }) => {
  const cards = [
    { label: "Total Gaji", value: stats.totalSalary, icon: DollarSign, color: "from-[#FF5A57] to-[#E02F75]" },
    { label: "Gaji Pokok", value: stats.basicSalary, icon: TrendingUp, color: "from-[#E02F75] to-[#6700A3]" },
    { label: "Total Tunjangan", value: stats.totalAllowance, icon: TrendingUp, color: "from-[#6700A3] to-[#050C38]" },
    { label: "Total Potongan", value: stats.totalDeduction, icon: TrendingDown, color: "from-[#050C38] to-[#FF5A57]" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(card.value)}</p>
              </div>
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
