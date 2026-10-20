import type { AttendanceMonthlySummary } from "./attendance.types";

export type ReportTabId = "absensi" | "gaji" | "karyawan" | "cuti";

export interface MonthlyTrendPoint {
  label: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface AttendanceReportData extends AttendanceMonthlySummary {
  trend: MonthlyTrendPoint[];
}

export interface SalaryDepartmentRow {
  divisi: string;
  jumlahKaryawan: number;
  totalGross: number;
  totalNet: number;
}

export interface SalaryReportData {
  totals: {
    slip: number;
    dibayar: number;
    pending: number;
    totalGross: number;
    totalNet: number;
    totalLembur: number;
    totalPotongan: number;
    totalPph21: number;
    totalBpjsKaryawan: number;
    totalBpjsPerusahaan: number;
  };
  byDepartment: SalaryDepartmentRow[];
  trend: { label: string; total: number }[];
}

export interface CountItem {
  label: string;
  value: number;
}

export interface EmployeeReportRow {
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  status: string;
  tanggalMasuk: string;
  keterangan: string;
}

export interface EmployeeReportData {
  totals: { total: number; aktif: number; percobaan: number; baru: number };
  byStatus: CountItem[];
  byDepartment: CountItem[];
  byEmploymentType: CountItem[];
  rows: EmployeeReportRow[];
}

export interface LeaveReportRow {
  nip: string;
  nama: string;
  tahunan: number;
  sakit: number;
  penting: number;
  diluarTanggungan: number;
  total: number;
}

export interface LeaveReportData {
  totals: { pengajuan: number; disetujui: number; menunggu: number; ditolak: number; hariCuti: number };
  byType: CountItem[];
  rows: LeaveReportRow[];
}
