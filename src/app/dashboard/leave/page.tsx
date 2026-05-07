"use client";

import React from "react";
import LeaveHeader from "@/features/leave/presentation/components/LeaveHeader";
import LeaveStats from "@/features/leave/presentation/components/LeaveStats";
import LeaveControls from "@/features/leave/presentation/components/LeaveControls";
import { DataTable } from "@/shared/components/DataTable";
import { useLeave } from "@/features/leave/presentation/hooks/useLeave";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { LeaveRequest } from "@/features/leave/domain/entities/leave";

export default function LeavePage() {
  const {
    data,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  } = useLeave();

  const columns = [
    { header: "Karyawan", accessor: "nama" as const },
    { header: "Jenis Cuti", accessor: "tipeCuti" as const },
    { header: "Mulai", accessor: "tanggalMulai" as const },
    { header: "Selesai", accessor: "tanggalSelesai" as const },
    {
      header: "Status",
      accessor: (item: LeaveRequest) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <LeaveHeader />
      <LeaveStats />
      <LeaveControls
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
