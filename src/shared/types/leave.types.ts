export interface LeaveRequest {
  id: string;
  nip: string;
  nama: string;
  tipeCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  durasi: string;
  status: string;
  approvedBy?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export type LeaveStatus = "Pending" | "Disetujui" | "Ditolak";
