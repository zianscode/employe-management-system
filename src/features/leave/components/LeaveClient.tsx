"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Ban, CalendarDays } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useLeave } from "@/features/leave/hooks/use-leave";
import { LeaveBalance, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import {
  approveLeaveAction,
  cancelLeaveAction,
  createLeaveRequestAction,
  rejectLeaveAction,
} from "@/server/modules/leave/leave.actions";
import { LeaveForm } from "./LeaveForm";
import LeaveHeader from "./LeaveHeader";
import LeaveStats, { LeaveStatData } from "./LeaveStats";
import LeaveControls from "./LeaveControls";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Cuti Tahunan",
  SICK: "Sakit",
  EMERGENCY: "Izin Penting",
  UNPAID: "Diluar Tanggungan",
};

interface LeaveClientProps {
  stats: LeaveStatData[];
  balance: LeaveBalance | null;
}

export function LeaveClient({ stats, balance }: LeaveClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rejecting, setRejecting] = React.useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const { data, searchQuery, setSearchQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, refresh } = useLeave();

  const reloadAll = async () => {
    await refresh();
    router.refresh();
  };

  const runAction = async (action: () => Promise<{ success: boolean; message: string }>) => {
    const res = await action();
    if (res.success) {
      toast.success(res.message);
      await reloadAll();
    } else {
      toast.error(res.message);
    }
    return res.success;
  };

  const handleApplyLeave = async (formData: LeaveRequestInput) => {
    setIsSubmitting(true);
    const ok = await runAction(() => createLeaveRequestAction(formData));
    if (ok) setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleConfirmReject = async () => {
    if (!rejecting) return;
    setIsSubmitting(true);
    const ok = await runAction(() => rejectLeaveAction(rejecting.id, rejectReason));
    if (ok) {
      setRejecting(null);
      setRejectReason("");
    }
    setIsSubmitting(false);
  };

  const columns: {
    header: string;
    accessor: keyof LeaveRequest | ((item: LeaveRequest) => React.ReactNode);
  }[] = [
    {
      header: "Karyawan",
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.nama}</span>
          <span className="text-xs text-gray-400">{item.nip}</span>
        </div>
      ),
    },
    { header: "Jenis Cuti", accessor: (item) => LEAVE_TYPE_LABELS[item.tipeCuti] || item.tipeCuti },
    {
      header: "Tanggal",
      accessor: (item) => (
        <div className="flex flex-col text-sm">
          <span>{item.tanggalMulai} – {item.tanggalSelesai}</span>
          <span className="text-xs text-gray-400">{item.durasi} hari kerja</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className="flex flex-col gap-1 items-start w-fit max-w-[220px]">
          <StatusBadge status={item.status} />
          {item.managerApprover && (
            <span className="text-[10px] text-gray-500">Atasan: {item.managerApprover.name}</span>
          )}
          {item.hrApprover && <span className="text-[10px] text-gray-500">HR: {item.hrApprover.name}</span>}
          {item.rejectedBy && (
            <span className="text-[10px] text-red-500">
              Ditolak {item.rejectedBy.name}: {item.rejectionReason}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex gap-2">
          {item.canApprove && (
            <button
              onClick={() => runAction(() => approveLeaveAction(item.id))}
              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              title="Setujui"
            >
              <Check size={18} />
            </button>
          )}
          {item.canReject && (
            <button
              onClick={() => setRejecting(item)}
              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              title="Tolak"
            >
              <X size={18} />
            </button>
          )}
          {item.canCancel && (
            <button
              onClick={() => runAction(() => cancelLeaveAction(item.id))}
              className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Batalkan pengajuan"
            >
              <Ban size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <LeaveHeader onAdd={() => setIsModalOpen(true)} />

      {balance && (
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <CalendarDays className="text-brand" size={22} />
          <p className="text-sm text-gray-600">
            Sisa cuti tahunan {balance.year}:{" "}
            <span className="font-bold text-gray-900">{balance.remaining} hari</span>{" "}
            <span className="text-gray-400">(jatah {balance.quota}, terpakai {balance.used})</span>
          </p>
        </div>
      )}

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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajukan Cuti Baru">
        <LeaveForm onSubmit={handleApplyLeave} onCancel={() => setIsModalOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Tolak Pengajuan Cuti">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tolak pengajuan cuti <span className="font-bold">{rejecting?.nama}</span> ({rejecting?.tanggalMulai} –{" "}
            {rejecting?.tanggalSelesai})?
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Alasan penolakan (wajib)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setRejecting(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={isSubmitting || !rejectReason.trim()}
              className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50"
            >
              Tolak
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
