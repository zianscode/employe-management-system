"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Ban, Check, Plus, X } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Form";
import { AttendanceCorrectionInput, AttendanceCorrectionRow } from "@/shared/types/attendance.types";
import { toDateKey } from "@/shared/utils/date";
import { notifyApprovalsChanged } from "@/features/layout/hooks/use-pending-approvals";
import {
  approveAttendanceCorrectionAction,
  cancelAttendanceCorrectionAction,
  getAttendanceCorrectionsAction,
  rejectAttendanceCorrectionAction,
  submitAttendanceCorrectionAction,
} from "@/server/modules/attendance/attendance-correction.actions";

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
    const res = await getAttendanceCorrectionsAction();
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
      submitAttendanceCorrectionAction({ ...form, checkIn: form.checkIn || undefined, checkOut: form.checkOut || undefined })
    );
    if (ok) setForm(null);
  };

  const handleReject = async () => {
    if (!rejecting) return;
    const ok = await run(() => rejectAttendanceCorrectionAction(rejecting.id, rejectReason));
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
          {r.reviewedBy && <span className="text-xs text-gray-500">oleh {r.reviewedBy}</span>}
          {r.rejectionReason && <span className="text-xs text-red-600">{r.rejectionReason}</span>}
        </div>
      ),
    },
    {
      header: "",
      accessor: (r) => (
        <div className="flex justify-end gap-1">
          {r.canReview && (
            <>
              <button
                type="button"
                onClick={() => run(() => approveAttendanceCorrectionAction(r.id))}
                disabled={isSubmitting}
                className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-700"
                title="Setujui"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRejecting(r)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Tolak"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {r.canCancel && (
            <button
              type="button"
              onClick={() => run(() => cancelAttendanceCorrectionAction(r.id))}
              disabled={isSubmitting}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Batalkan"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Koreksi absensi"
        description="Perbaikan jam masuk atau pulang, maksimal 30 hari ke belakang"
        action={
          canSubmit && (
            <Button variant="secondary" size="sm" onClick={() => setForm({ ...EMPTY_FORM, date: toDateKey() })}>
              <Plus className="h-4 w-4" />
              Ajukan koreksi
            </Button>
          )
        }
      />

      <DataTable columns={columns} data={rows} emptyMessage="Belum ada pengajuan koreksi" />

      <Modal isOpen={!!form} onClose={() => setForm(null)} title="Ajukan koreksi absensi">
        {form && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Tanggal" htmlFor="correction-date" required>
              <Input
                id="correction-date"
                type="date"
                required
                max={toDateKey()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Jam masuk" htmlFor="correction-in">
                <Input id="correction-in" type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              </Field>
              <Field label="Jam pulang" htmlFor="correction-out">
                <Input id="correction-out" type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </Field>
            </div>
            <p className="text-xs text-gray-500">Kosongkan jam yang tidak perlu dikoreksi.</p>
            <Field label="Alasan" htmlFor="correction-reason" required>
              <Textarea
                id="correction-reason"
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Misal: lupa check-out karena rapat di luar kantor"
              />
            </Field>
            <ModalActions>
              <Button variant="secondary" onClick={() => setForm(null)}>
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
          <p className="text-sm text-gray-600">
            Koreksi dari <span className="font-medium text-gray-900">{rejecting?.nama}</span> untuk tanggal {rejecting?.tanggal}.
          </p>
          <Field label="Alasan penolakan" htmlFor="reject-reason" required>
            <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </Field>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()} loading={isSubmitting}>
              Tolak
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </Card>
  );
}
