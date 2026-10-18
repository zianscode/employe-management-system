import type { LeaveStatus, LeaveType } from "@prisma/client";

export interface LeaveApprover {
  name: string;
  at: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  nip: string;
  nama: string;
  tipeCuti: LeaveType;
  tanggalMulai: string;
  tanggalSelesai: string;
  durasi: number;
  status: LeaveStatus;
  reason: string;
  managerApprover: LeaveApprover | null;
  hrApprover: LeaveApprover | null;
  rejectedBy: LeaveApprover | null;
  rejectionReason: string | null;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
}

export interface LeaveRequestInput {
  employeeId?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalance {
  year: number;
  quota: number;
  used: number;
  remaining: number;
}
