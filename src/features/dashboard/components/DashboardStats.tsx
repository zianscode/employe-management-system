import React from "react";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";
import { formatTime } from "@/shared/utils/date";

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
      <StatGrid className="lg:grid-cols-3">
        <StatCard
          label="Absensi hari ini"
          value={stats.attendanceStatus}
          hint={stats.checkInTime ? `Masuk ${formatTime(new Date(stats.checkInTime))}` : "Belum check-in"}
        />
        <StatCard label="Sisa cuti tahunan" value={`${stats.remainingLeave} hari`} />
        <StatCard label="Gaji sudah dibayar" value={`${stats.totalSalaryReceived} bulan`} />
      </StatGrid>
    );
  }

  const stats = data.stats as OrganizationalStats;
  return (
    <StatGrid>
      <StatCard label="Karyawan aktif" value={stats.totalEmployees} />
      <StatCard label="Hadir hari ini" value={stats.presentToday} hint={`dari ${stats.totalEmployees} karyawan`} />
      <StatCard label="Tingkat kehadiran" value={`${stats.efficiency}%`} />
      <StatCard label="Cuti menunggu persetujuan" value={stats.leaveRequests} />
    </StatGrid>
  );
};

export default DashboardStats;
