import type { AttendanceStatus } from "@prisma/client";

export type DailyAttendanceStatus = AttendanceStatus | "NOT_YET";

export interface Attendance {
  employeeId: string;
  nip: string;
  nama: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  jamKerja: string;
  status: DailyAttendanceStatus;
  keterangan: string;
}

export interface MyTodayAttendance {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: DailyAttendanceStatus;
  lateInMinutes: number;
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
  onLeave: boolean;
}

export interface AttendanceMonthlyRow {
  employeeId: string;
  nip: string;
  nama: string;
  divisi: string;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
  menitTerlambat: number;
  jamLembur: number;
}

export interface AttendanceMonthlySummary {
  rows: AttendanceMonthlyRow[];
  totals: { hadir: number; terlambat: number; izin: number; sakit: number; alpha: number };
  attendanceRate: number;
}

export interface AttendanceCorrectionRow {
  id: string;
  employeeId: string;
  nip: string;
  nama: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewedBy: string | null;
  rejectionReason: string | null;
  canReview: boolean;
  canCancel: boolean;
}

export interface AttendanceCorrectionInput {
  date: string;
  checkIn?: string;
  checkOut?: string;
  reason: string;
}
