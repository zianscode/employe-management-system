import type { LeaveStatus, LeaveType } from "@prisma/client";

export interface LeaveApprover {
  name: string;
  /** ISO string */
  at: string | null;
}

/** Baris pada tabel cuti */
export interface LeaveRequest {
  id: string;
  employeeId: string;
  nip: string;
  nama: string;
  tipeCuti: LeaveType;
  tanggalMulai: string;
  tanggalSelesai: string;
  /** Jumlah hari kerja */
  durasi: number;
  status: LeaveStatus;
  reason: string;
  managerApprover: LeaveApprover | null;
  hrApprover: LeaveApprover | null;
  rejectedBy: LeaveApprover | null;
  rejectionReason: string | null;
  /** Aksi yang boleh dilakukan user yang sedang login (dihitung di server) */
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
}

export interface LeaveRequestInput {
  /** Hanya dipakai HR/Admin saat mengajukan atas nama karyawan lain */
  employeeId?: string;
  type: LeaveType;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  reason: string;
}

export interface LeaveBalance {
  year: number;
  quota: number;
  used: number;
  remaining: number;
}
