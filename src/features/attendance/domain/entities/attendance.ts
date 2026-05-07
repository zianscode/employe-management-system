export interface Attendance {
  nip: string;
  nama: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  jamKerja: string;
  status: string;
}

export type AttendanceStatus = "Hadir" | "Izin" | "Terlambat" | "Alpha" | "Sakit";
