import React from "react";
import { CalendarX, Clock, UserCheck, Users } from "lucide-react";
import { StatCard, StatGrid, StatTone } from "@/shared/components/StatCard";

export interface StatData {
  label: string;
  value: string;
  change: string;
  type: "success" | "warning" | "danger" | "neutral";
}

const TONE_BY_TYPE: Record<StatData["type"], StatTone> = {
  neutral: "primary",
  success: "success",
  warning: "warning",
  danger: "destructive",
};

const ICONS = [Users, UserCheck, Clock, CalendarX];

interface AttendanceStatsProps {
  stats: StatData[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
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

export default AttendanceStats;
