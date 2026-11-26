"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/api/session";
import { toast } from "sonner";
import { FilePen, Plus } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { ApprovalActions } from "@/shared/components/ApprovalActions";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { AttendanceCorrectionInput, AttendanceCorrectionRow } from "@/shared/types/attendance.types";
import { toDateKey } from "@/shared/utils/date";
import { notifyApprovalsChanged } from "@/features/layout/hooks/use-pending-approvals";
import {
  approveAttendanceCorrection,
  cancelAttendanceCorrection,
  getAttendanceCorrections,
  rejectAttendanceCorrection,
  submitAttendanceCorrection,
} from "@/lib/api/client";

const EMPTY_FORM: AttendanceCorrectionInput = { date: "", checkIn: "", checkOut: "", reason: "" };

export function CorrectionPanel({ onChange }: { onChange: () => void }) {
  const { data: session } = useSession();
  const canSubmit = !!session?.user?.employeeId;

  const [rows, setRows] = useState<AttendanceCorrectionRow[]>([]);
  const [form, setForm] = useState<AttendanceCorrectionInput | null>(null);
  const [rejecting, setRejecting] = useState<AttendanceCorrectionRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await getAttendanceCorrections();
    if (res.success && res.data) setRows(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action: () => Promise<{ success: boolean; message: string }>) => {
    setIsSubmitting(true);
    const res = await action();
    if (res.success) {
      toast.success(res.message);
      notifyApprovalsChanged();
      await load();
      onChange();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
    return res.success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const ok = await run(() =>
      submitAttendanceCorrection({ ...form, checkIn: form.checkIn || undefined, checkOut: form.checkOut || undefined })
    );
    if (ok) setForm(null);
  };

  const handleReject = async () => {
    if (!rejecting) return;
    const ok = await run(() => rejectAttendanceCorrection(rejecting.id, rejectReason));
    if (ok) {
      setRejecting(null);
      setRejectReason("");
    }
  };

  const columns: { header: string; accessor: keyof AttendanceCorrectionRow | ((r: AttendanceCorrectionRow) => React.ReactNode) }[] = [
    { header: "Karyawan", accessor: "nama" },
    { header: "Tanggal", accessor: "tanggal" },
    { header: "Masuk", accessor: "jamMasuk" },
    { header: "Pulang", accessor: "jamKeluar" },
    { header: "Alasan", accessor: "reason" },
    {
      header: "Status",
      accessor: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.status} />
          {r.reviewedBy && <span className="text-xs text-muted-foreground">oleh {r.reviewedBy}</span>}
          {r.rejectionReason && <span className="text-xs text-destructive">{r.rejectionReason}</span>}
        </div>
      ),
    },
    {
      header: "",
      accessor: (r) => (
        <ApprovalActions
          canApprove={r.canReview}
          canReject={r.canReview}
          canCancel={r.canCancel}
          disabled={isSubmitting}
          onApprove={() => run(() => approveAttendanceCorrection(r.id))}
          onReject={() => setRejecting(r)}
          onCancel={() => run(() => cancelAttendanceCorrection(r.id))}
        />
      ),
    },
  ];

  return (
    <Card>
      <CardHeading
        title="Koreksi absensi"
        description="Perbaikan jam masuk atau pulang, maksimal 30 hari ke belakang"
        action={
          canSubmit && (
            <Button variant="outline" size="sm" onClick={() => setForm({ ...EMPTY_FORM, date: toDateKey() })}>
              <Plus className="h-4 w-4" />
              Ajukan koreksi
            </Button>
          )
        }
      />

      <DataTable columns={columns} data={rows} emptyIcon={FilePen}
        emptyMessage="Belum ada pengajuan koreksi"
        emptyDescription="Lupa check-in atau check-out? Ajukan koreksi lewat tombol di atas." />

      <Modal isOpen={!!form} onClose={() => setForm(null)} title="Ajukan koreksi absensi">
        {form && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Tanggal" htmlFor="correction-date" required>
              <Input
                id="correction-date"
                type="date"
                required
                max={toDateKey()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Jam masuk" htmlFor="correction-in">
                <Input id="correction-in" type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              </FormField>
              <FormField label="Jam pulang" htmlFor="correction-out">
                <Input id="correction-out" type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </FormField>
            </div>
            <p className="text-xs text-muted-foreground">Kosongkan jam yang tidak perlu dikoreksi.</p>
            <FormField label="Alasan" htmlFor="correction-reason" required>
              <Textarea
                id="correction-reason"
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Misal: lupa check-out karena rapat di luar kantor"
              />
            </FormField>
            <ModalActions>
              <Button variant="outline" onClick={() => setForm(null)}>
                Batal
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Kirim
              </Button>
            </ModalActions>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Tolak koreksi absensi">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Koreksi dari <span className="font-medium text-foreground">{rejecting?.nama}</span> untuk tanggal {rejecting?.tanggal}.
          </p>
          <FormField label="Alasan penolakan" htmlFor="reject-reason" required>
            <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </FormField>
          <ModalActions>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()} loading={isSubmitting}>
              Tolak
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </Card>
  );
}
