import React from "react";
import { CalendarClock, CalendarDays, Percent, UserCheck, Users, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/StatCard";

export interface PersonalStats {
  attendanceStatus: string;
  checkInTime: Date | string | null;
  remainingLeave: number;
  totalSalaryReceived: number;
}

export interface OrganizationalStats {
  totalEmployees: number;
  presentToday: number;
  leaveRequests: number;
  efficiency: number;
}

export interface DashboardData {
  type: "PERSONAL" | "ORGANIZATIONAL";
  stats: PersonalStats | OrganizationalStats;
}

interface DashboardStatsProps {
  data: DashboardData | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  if (!data) return null;

  if (data.type === "PERSONAL") {
    const stats = data.stats as PersonalStats;
    return (
      <StatGrid className="lg:grid-cols-2">
        <StatCard label="Sisa cuti tahunan" value={`${stats.remainingLeave} hari`} icon={CalendarDays} tone="success" />
        <StatCard label="Gaji sudah dibayar" value={`${stats.totalSalaryReceived} bulan`} icon={Wallet} />
      </StatGrid>
    );
  }

  const stats = data.stats as OrganizationalStats;
  return (
    <StatGrid>
      <StatCard label="Karyawan aktif" value={stats.totalEmployees} icon={Users} />
      <StatCard label="Hadir hari ini" value={stats.presentToday} hint={`dari ${stats.totalEmployees} karyawan`} icon={UserCheck} tone="success" />
      <StatCard label="Tingkat kehadiran" value={`${stats.efficiency}%`} icon={Percent} tone="info" />
      <StatCard label="Cuti menunggu persetujuan" value={stats.leaveRequests} icon={CalendarClock} tone="warning" />
    </StatGrid>
  );
};

export default DashboardStats;
