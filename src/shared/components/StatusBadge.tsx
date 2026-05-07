import React from "react";
import { Clock, UserCheck, UserX, AlertCircle, Users } from "lucide-react";

export type StatusType = "Hadir" | "Izin" | "Terlambat" | "Alpha" | "Sakit" | string;

interface StatusBadgeProps {
  status: StatusType;
}

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case "Hadir":
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <UserCheck className="w-4 h-4" />,
      };
    case "Izin":
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Clock className="w-4 h-4" />,
      };
    case "Terlambat":
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    case "Alpha":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <UserX className="w-4 h-4" />,
      };
    case "Sakit":
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <Users className="w-4 h-4" />,
      };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { color, icon } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {icon}
      {status}
    </span>
  );
};
