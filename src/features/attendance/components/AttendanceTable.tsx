import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Attendance } from "@/shared/types/attendance.types";

interface AttendanceTableProps {
  data: Attendance[];
  isLoading: boolean;
  selectedDate: string;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  isLoading,
  selectedDate,
}) => {
  const columns = [
    { header: "NIP", accessor: "nip" as const, className: "font-medium text-gray-900" },
    { header: "Nama Karyawan", accessor: "nama" as const, className: "font-medium" },
    { header: "Tanggal", accessor: "tanggal" as const },
    { header: "Jam Masuk", accessor: "jamMasuk" as const },
    { header: "Jam Keluar", accessor: "jamKeluar" as const },
    { header: "Jam Kerja", accessor: "jamKerja" as const },
    {
      header: "Status",
      accessor: (item: Attendance) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Data Absensi
        </h2>
        <p className="text-gray-600 text-sm">
          Data kehadiran karyawan untuk tanggal {selectedDate}
        </p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
};
