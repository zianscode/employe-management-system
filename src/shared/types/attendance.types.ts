import type { AttendanceStatus } from "@prisma/client";

/** Status harian. NOT_YET = hari ini belum absen & jam kerja belum selesai (tidak disimpan di DB). */
export type DailyAttendanceStatus = AttendanceStatus | "NOT_YET";

/** Baris pada tabel absensi harian */
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

/** Absensi milik user yang login untuk hari ini (kartu check-in/check-out) */
export interface MyTodayAttendance {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: DailyAttendanceStatus;
  lateInMinutes: number;
  workStartTime: string;
  workEndTime: string;
  onLeave: boolean;
}
