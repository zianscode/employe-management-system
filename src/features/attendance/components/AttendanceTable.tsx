import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Attendance } from "@/shared/types/attendance.types";

interface AttendanceTableProps {
  data: Attendance[];
  isLoading: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, isLoading }) => {
  const columns = [
    {
      header: "Karyawan",
      accessor: (item: Attendance) => (
        <div>
          <p className="font-medium text-gray-900">{item.nama}</p>
          <p className="text-xs tabular-nums text-gray-500">{item.nip}</p>
        </div>
      ),
    },
    { header: "Tanggal", accessor: "tanggal" as const },
    { header: "Masuk", accessor: "jamMasuk" as const, className: "tabular-nums" },
    { header: "Pulang", accessor: "jamKeluar" as const, className: "tabular-nums" },
    { header: "Jam kerja", accessor: "jamKerja" as const, className: "tabular-nums" },
    { header: "Status", accessor: (item: Attendance) => <StatusBadge status={item.status} /> },
    { header: "Keterangan", accessor: (item: Attendance) => item.keterangan || "-" },
  ];

  return <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Tidak ada data absensi" />;
};
