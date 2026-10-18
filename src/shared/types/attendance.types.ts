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
  onLeave: boolean;
}
