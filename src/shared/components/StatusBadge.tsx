import React from "react";
import { Clock, UserCheck, UserX, AlertCircle, Users } from "lucide-react";

export type StatusType = "Hadir" | "Izin" | "Terlambat" | "Alpha" | "Sakit" | string;

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
}

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case "Hadir":
    case "ACTIVE":
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <UserCheck className="w-4 h-4" />,
        label: status === "ACTIVE" ? "Aktif" : "Hadir",
      };
    case "Izin":
    case "LEAVE":
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Clock className="w-4 h-4" />,
        label: status === "LEAVE" ? "Cuti" : "Izin",
      };
    case "Terlambat":
    case "PROBATION":
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <AlertCircle className="w-4 h-4" />,
        label: status === "PROBATION" ? "Masa Percobaan" : "Terlambat",
      };
    case "Alpha":
    case "TERMINATED":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <UserX className="w-4 h-4" />,
        label: status === "TERMINATED" ? "Diberhentikan" : "Alpha",
      };
    case "Sakit":
    case "RESIGNED":
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <AlertCircle className="w-4 h-4" />,
        label: status === "RESIGNED" ? "Resigned" : "Sakit",
      };
    case "PENDING":
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
        label: "Menunggu",
      };
    case "MANAGER_APPROVED":
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <UserCheck className="w-4 h-4" />,
        label: "Disetujui Manager",
      };
    case "HR_APPROVED":
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <UserCheck className="w-4 h-4" />,
        label: "Disetujui HR",
      };
    case "REJECTED":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <UserX className="w-4 h-4" />,
        label: "Ditolak",
      };
    case "CANCELLED":
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <UserX className="w-4 h-4" />,
        label: "Dibatalkan",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <Users className="w-4 h-4" />,
        label: status,
      };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const { color, icon, label } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border w-fit whitespace-nowrap ${color}`}
    >
      {icon}
      {customLabel || label}
    </span>
  );
};
