import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "secondary";

const STATUS_CONFIG: Record<string, { variant: StatusVariant; label: string }> = {
  ACTIVE: { variant: "success", label: "Aktif" },
  PROBATION: { variant: "warning", label: "Masa Percobaan" },
  RESIGNED: { variant: "secondary", label: "Resign" },
  TERMINATED: { variant: "destructive", label: "Diberhentikan" },
  PRESENT: { variant: "success", label: "Hadir" },
  LATE: { variant: "warning", label: "Terlambat" },
  ABSENT: { variant: "destructive", label: "Tidak Hadir" },
  SICK: { variant: "info", label: "Sakit" },
  PERMISSION: { variant: "info", label: "Izin / Cuti" },
  EARLY_LEAVE: { variant: "warning", label: "Pulang Cepat" },
  NOT_YET: { variant: "secondary", label: "Belum Absen" },
  PENDING: { variant: "warning", label: "Menunggu" },
  MANAGER_APPROVED: { variant: "info", label: "Disetujui Atasan" },
  HR_APPROVED: { variant: "success", label: "Disetujui HR" },
  APPROVED: { variant: "success", label: "Disetujui" },
  REJECTED: { variant: "destructive", label: "Ditolak" },
  CANCELLED: { variant: "secondary", label: "Dibatalkan" },
  PAID: { variant: "success", label: "Dibayar" },
  UNPAID: { variant: "warning", label: "Belum Dibayar" },
};

const DOT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  secondary: "bg-muted-foreground",
};

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([key, config]) => [key, config.label]),
);

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const config = STATUS_CONFIG[status] ?? { variant: "secondary" as const, label: status };
  return (
    <Badge variant={config.variant}>
      <span className={cn("size-1.5 rounded-full", DOT_CLASSES[config.variant])} aria-hidden />
      {customLabel || config.label}
    </Badge>
  );
};
