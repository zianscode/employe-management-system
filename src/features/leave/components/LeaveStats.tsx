import React from "react";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";

export interface LeaveStatData {
  label: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger" | "neutral";
}

interface LeaveStatsProps {
  stats: LeaveStatData[];
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  return (
    <StatGrid>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.change || undefined} />
      ))}
    </StatGrid>
  );
};

export default LeaveStats;
