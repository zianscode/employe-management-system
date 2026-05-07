export interface AttendanceTrend {
  month: string;
  kehadiran: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface AttendanceDistribution {
  name: string;
  value: number;
  color: string;
}

export type ReportTabId = "absensi" | "gaji" | "karyawan" | "cuti";

export interface ReportStat {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  bgColor: string;
  color?: string;
}
