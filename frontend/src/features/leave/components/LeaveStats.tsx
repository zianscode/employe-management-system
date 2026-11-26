import React from "react";
import { CalendarCheck, CalendarDays, CalendarX, Hourglass } from "lucide-react";
import { StatCard, StatGrid, StatTone } from "@/shared/components/StatCard";

export interface LeaveStatData {
  label: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger" | "neutral";
}

const TONE_BY_TYPE: Record<LeaveStatData["type"], StatTone> = {
  neutral: "primary",
  success: "success",
  warning: "warning",
  danger: "destructive",
};

const ICONS = [CalendarDays, CalendarCheck, Hourglass, CalendarX];

interface LeaveStatsProps {
  stats: LeaveStatData[];
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  return (
    <StatGrid>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          hint={stat.change || undefined}
          icon={ICONS[index]}
          tone={TONE_BY_TYPE[stat.type]}
        />
      ))}
    </StatGrid>
  );
};

export default LeaveStats;
