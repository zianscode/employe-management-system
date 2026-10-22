import React from "react";
import { Badge, type BadgeTone } from "./ui/Badge";

export type StatusType = string;

const STATUS_CONFIG: Record<string, { tone: BadgeTone; label: string }> = {
  ACTIVE: { tone: "green", label: "Aktif" },
  PROBATION: { tone: "yellow", label: "Masa Percobaan" },
  RESIGNED: { tone: "gray", label: "Resign" },
  TERMINATED: { tone: "red", label: "Diberhentikan" },
  PRESENT: { tone: "green", label: "Hadir" },
  LATE: { tone: "yellow", label: "Terlambat" },
  ABSENT: { tone: "red", label: "Tidak Hadir" },
  SICK: { tone: "blue", label: "Sakit" },
  PERMISSION: { tone: "blue", label: "Izin / Cuti" },
  EARLY_LEAVE: { tone: "yellow", label: "Pulang Cepat" },
  NOT_YET: { tone: "gray", label: "Belum Absen" },
  PENDING: { tone: "yellow", label: "Menunggu" },
  MANAGER_APPROVED: { tone: "blue", label: "Disetujui Atasan" },
  HR_APPROVED: { tone: "green", label: "Disetujui HR" },
  APPROVED: { tone: "green", label: "Disetujui" },
  REJECTED: { tone: "red", label: "Ditolak" },
  CANCELLED: { tone: "gray", label: "Dibatalkan" },
  PAID: { tone: "green", label: "Dibayar" },
  UNPAID: { tone: "yellow", label: "Belum Dibayar" },
  Hadir: { tone: "green", label: "Hadir" },
  Izin: { tone: "blue", label: "Izin / Cuti" },
  Sakit: { tone: "blue", label: "Sakit" },
  Terlambat: { tone: "yellow", label: "Terlambat" },
  Alpha: { tone: "red", label: "Alpha" },
};

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([key, config]) => [key, config.label]),
);

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const config = STATUS_CONFIG[status] ?? { tone: "gray" as const, label: status };
  return <Badge tone={config.tone}>{customLabel || config.label}</Badge>;
};
