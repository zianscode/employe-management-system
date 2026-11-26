"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/FormField";
import { Textarea } from "@/shared/components/ui/textarea";
import { ApprovalActions } from "@/shared/components/ApprovalActions";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useLeave } from "@/features/leave/hooks/use-leave";
import { notifyApprovalsChanged } from "@/features/layout/hooks/use-pending-approvals";
import { LeaveBalance, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import {
  approveLeave,
  cancelLeave,
  createLeaveRequest,
  rejectLeave,
} from "@/lib/api/client";
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
    const ok = await runAction(() => createLeaveRequest(formData));
    if (ok) setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleConfirmReject = async () => {
    if (!rejecting) return;
    setIsSubmitting(true);
    const ok = await runAction(() => rejectLeave(rejecting.id, rejectReason));
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
          <p className="font-medium text-foreground">{item.nama}</p>
          <p className="text-xs tabular-nums text-muted-foreground">{item.nip}</p>
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
          <p className="text-xs text-muted-foreground">{item.durasi} hari kerja</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className="flex max-w-56 flex-col items-start gap-1 whitespace-normal">
          <StatusBadge status={item.status} />
          {item.nextStep && <span className="text-xs text-muted-foreground">{item.nextStep}</span>}
          {item.managerApprover && <span className="text-xs text-muted-foreground">Atasan: {item.managerApprover.name}</span>}
          {item.hrApprover && <span className="text-xs text-muted-foreground">HR: {item.hrApprover.name}</span>}
          {item.rejectedBy && (
            <span className="text-xs text-destructive">
              Ditolak {item.rejectedBy.name}: {item.rejectionReason}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "",
      accessor: (item) => (
        <ApprovalActions
          canApprove={item.canApprove}
          canReject={item.canReject}
          canCancel={item.canCancel}
          onApprove={() => runAction(() => approveLeave(item.id))}
          onReject={() => setRejecting(item)}
          onCancel={() => runAction(() => cancelLeave(item.id))}
        />
      ),
    },
  ];

  return (
    <>
      <LeaveHeader onAdd={() => setIsModalOpen(true)} />

      {balance && (
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4 text-sm">
          <p className="font-medium text-foreground">Cuti tahunan {balance.year}</p>
          <p className="text-muted-foreground">
            Sisa <span className="font-medium tabular-nums text-foreground">{balance.remaining} hari</span>
          </p>
          <p className="text-muted-foreground">
            Terpakai <span className="tabular-nums text-foreground">{balance.used}</span> dari{" "}
            <span className="tabular-nums text-foreground">{balance.quota}</span> hari
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
        <DataTable columns={columns} data={data} emptyIcon={CalendarDays}
          emptyMessage="Belum ada pengajuan cuti"
          emptyDescription="Klik Ajukan cuti untuk membuat pengajuan baru." />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajukan cuti">
        <LeaveForm onSubmit={handleApplyLeave} onCancel={() => setIsModalOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Tolak pengajuan cuti">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pengajuan dari <span className="font-medium text-foreground">{rejecting?.nama}</span>, {rejecting?.tanggalMulai} –{" "}
            {rejecting?.tanggalSelesai}.
          </p>
          <FormField label="Alasan penolakan" htmlFor="leave-reject-reason" required>
            <Textarea id="leave-reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </FormField>
          <ModalActions>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim()} loading={isSubmitting}>
              Tolak
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </>
  );
}
