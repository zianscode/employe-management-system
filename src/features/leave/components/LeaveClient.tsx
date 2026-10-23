"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Ban } from "lucide-react";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Field, Textarea } from "@/shared/components/ui/Form";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useLeave } from "@/features/leave/hooks/use-leave";
import { notifyApprovalsChanged } from "@/features/layout/hooks/use-pending-approvals";
import { LeaveBalance, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import {
  approveLeaveAction,
  cancelLeaveAction,
  createLeaveRequestAction,
  rejectLeaveAction,
} from "@/server/modules/leave/leave.actions";
import { LEAVE_TYPE_LABELS } from "@/shared/constants/leave";
import { LeaveForm } from "./LeaveForm";
import LeaveHeader from "./LeaveHeader";
import LeaveStats, { LeaveStatData } from "./LeaveStats";
import LeaveControls from "./LeaveControls";

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
      notifyApprovalsChanged();
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
    className?: string;
    accessor: keyof LeaveRequest | ((item: LeaveRequest) => React.ReactNode);
  }[] = [
    {
      header: "Karyawan",
      accessor: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.nama}</p>
          <p className="text-xs tabular-nums text-gray-500">{item.nip}</p>
        </div>
      ),
    },
    { header: "Jenis", accessor: (item) => LEAVE_TYPE_LABELS[item.tipeCuti] || item.tipeCuti },
    {
      header: "Tanggal",
      accessor: (item) => (
        <div>
          <p>
            {item.tanggalMulai} – {item.tanggalSelesai}
          </p>
          <p className="text-xs text-gray-500">{item.durasi} hari kerja</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className="flex max-w-56 flex-col items-start gap-1 whitespace-normal">
          <StatusBadge status={item.status} />
          {item.nextStep && <span className="text-xs text-gray-600">{item.nextStep}</span>}
          {item.managerApprover && <span className="text-xs text-gray-500">Atasan: {item.managerApprover.name}</span>}
          {item.hrApprover && <span className="text-xs text-gray-500">HR: {item.hrApprover.name}</span>}
          {item.rejectedBy && (
            <span className="text-xs text-red-600">
              Ditolak {item.rejectedBy.name}: {item.rejectionReason}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "",
      accessor: (item) => (
        <div className="flex justify-end gap-1">
          {item.canApprove && (
            <button
              type="button"
              onClick={() => runAction(() => approveLeaveAction(item.id))}
              className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-700"
              title="Setujui"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {item.canReject && (
            <button
              type="button"
              onClick={() => setRejecting(item)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Tolak"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {item.canCancel && (
            <button
              type="button"
              onClick={() => runAction(() => cancelLeaveAction(item.id))}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Batalkan pengajuan"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <LeaveHeader onAdd={() => setIsModalOpen(true)} />

      {balance && (
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4 text-sm">
          <p className="font-medium text-gray-900">Cuti tahunan {balance.year}</p>
          <p className="text-gray-500">
            Sisa <span className="font-medium tabular-nums text-gray-900">{balance.remaining} hari</span>
          </p>
          <p className="text-gray-500">
            Terpakai <span className="tabular-nums text-gray-900">{balance.used}</span> dari{" "}
            <span className="tabular-nums text-gray-900">{balance.quota}</span> hari
          </p>
        </Card>
      )}

      <LeaveStats stats={stats} />

      <Card>
        <LeaveControls
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
        />
        <DataTable columns={columns} data={data} emptyMessage="Belum ada pengajuan cuti" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajukan cuti">
        <LeaveForm onSubmit={handleApplyLeave} onCancel={() => setIsModalOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Tolak pengajuan cuti">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pengajuan dari <span className="font-medium text-gray-900">{rejecting?.nama}</span>, {rejecting?.tanggalMulai} –{" "}
            {rejecting?.tanggalSelesai}.
          </p>
          <Field label="Alasan penolakan" htmlFor="leave-reject-reason" required>
            <Textarea id="leave-reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </Field>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmReject} disabled={!rejectReason.trim()} loading={isSubmitting}>
              Tolak
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </>
  );
}
