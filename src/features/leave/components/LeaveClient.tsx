"use client";

import React from "react";
import { Modal } from "@/shared/components/Modal";
import { LeaveForm } from "./LeaveForm";
import LeaveHeader from "./LeaveHeader";
import LeaveStats, { LeaveStatData } from "./LeaveStats";
import LeaveControls from "./LeaveControls";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useLeave } from "@/features/leave/hooks/use-leave";
import { LeaveRequest } from "@/shared/types/leave.types";
import { createLeaveRequest, updateLeaveStatus } from "@/server/modules/leave/leave.actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

import { LeaveType, LeaveStatus } from "@prisma/client";

interface LeaveRequestInput {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export function LeaveClient({ stats, userRole }: { stats: LeaveStatData[], userRole: string }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isAdminOrHR = userRole === "SUPER_ADMIN" || userRole === "HR";

  const {
    data,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh,
  } = useLeave();

  const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
    const res = await updateLeaveStatus(id, status);
    if (res.success) {
      toast.success(`Permohonan ${status === "HR_APPROVED" ? "disetujui" : "ditolak"}`);
      refresh();
    } else {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleApplyLeave = async (formData: LeaveRequestInput) => {
    setIsSubmitting(true);
    const res = await createLeaveRequest(formData);
    if (res.success) {
      toast.success("Permohonan cuti berhasil diajukan");
      setIsModalOpen(false);
      refresh();
    } else {
      toast.error("Gagal mengajukan cuti");
    }
    setIsSubmitting(false);
  };

  const baseColumns: { 
    header: string; 
    accessor: keyof LeaveRequest | ((item: LeaveRequest) => React.ReactNode) 
  }[] = [
    { header: "Karyawan", accessor: "nama" },
    { header: "Jenis Cuti", accessor: "tipeCuti" },
    { header: "Mulai", accessor: "tanggalMulai" },
    { header: "Selesai", accessor: "tanggalSelesai" },
    {
      header: "Status",
      accessor: (item: LeaveRequest) => {
        let label = undefined;
        if (item.status === "HR_APPROVED" || item.status === "MANAGER_APPROVED") {
          const roleLabel = item.approvedBy?.role === "SUPER_ADMIN" ? "Admin" : (item.approvedBy?.role || "HR");
          label = `Disetujui ${roleLabel}`;
        }

        return (
          <div className="flex flex-col gap-1.5 items-start w-fit">
            <StatusBadge status={item.status} customLabel={label} />
            {item.approvedBy && (
              <div className="flex flex-col ml-1">
                <span className="text-[10px] text-gray-500 font-bold leading-none">
                  {item.approvedBy.name}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">
                  {item.approvedBy.email}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const columns = [...baseColumns];

  // Add actions column for Admin/HR
  if (isAdminOrHR) {
    columns.push({
      header: "Aksi",
      accessor: (item: LeaveRequest) => (
        <div className="flex gap-2">
          {item.status === "PENDING" && (
            <>
              <button
                onClick={() => handleUpdateStatus(item.id, "HR_APPROVED")}
                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                title="Setujui"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Tolak"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <LeaveHeader onAdd={() => setIsModalOpen(true)} />
      
      <LeaveStats stats={stats} />
      
      <div className="space-y-4">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajukan Cuti Baru"
      >
        <LeaveForm
          onSubmit={handleApplyLeave}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
