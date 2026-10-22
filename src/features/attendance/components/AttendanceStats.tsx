import React from "react";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";

export interface StatData {
  label: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger" | "neutral";
}

interface AttendanceStatsProps {
  stats: StatData[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <StatGrid>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.change || undefined} />
      ))}
    </StatGrid>
  );
};

export default AttendanceStats;
