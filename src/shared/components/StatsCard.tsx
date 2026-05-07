import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  colorClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, colorClass }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
      <div className="p-6 text-center">
        <div className="text-3xl font-bold text-gray-800 mb-1">
          {value}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
};

interface StatsGridProps {
  stats: StatsCardProps[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};
