export interface LeaveRequest {
  nip: string;
  nama: string;
  tipeCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  durasi: string;
  status: string;
}

export type LeaveStatus = "Pending" | "Disetujui" | "Ditolak";
