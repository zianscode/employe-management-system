"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Ban, Check, FilePen, X } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Modal } from "@/shared/components/Modal";
import { AttendanceCorrectionInput, AttendanceCorrectionRow } from "@/shared/types/attendance.types";
import { toDateKey } from "@/shared/utils/date";
import {
  approveAttendanceCorrectionAction,
  cancelAttendanceCorrectionAction,
  getAttendanceCorrectionsAction,
  rejectAttendanceCorrectionAction,
  submitAttendanceCorrectionAction,
} from "@/server/modules/attendance/attendance-correction.actions";

const STATUS_STYLES: Record<AttendanceCorrectionRow["status"], { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-gray-100 text-gray-600" },
};

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium";

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
          <span className={`w-fit px-3 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[r.status].className}`}>
            {STATUS_STYLES[r.status].label}
          </span>
          {r.reviewedBy && <span className="text-[10px] text-gray-500">oleh {r.reviewedBy}</span>}
          {r.rejectionReason && <span className="text-[10px] text-red-500">{r.rejectionReason}</span>}
        </div>
      ),
    },
    {
      header: "Aksi",
      accessor: (r) => (
        <div className="flex gap-2">
          {r.canReview && (
            <>
              <button
                onClick={() => run(() => approveAttendanceCorrectionAction(r.id))}
                disabled={isSubmitting}
                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                title="Setujui"
              >
                <Check size={18} />
              </button>
              <button onClick={() => setRejecting(r)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Tolak">
                <X size={18} />
              </button>
            </>
          )}
          {r.canCancel && (
            <button
              onClick={() => run(() => cancelAttendanceCorrectionAction(r.id))}
              disabled={isSubmitting}
              className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
              title="Batalkan"
            >
              <Ban size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Koreksi Absensi</h2>
          <p className="text-gray-600 text-sm">Pengajuan perbaikan jam masuk/pulang, maksimal 30 hari ke belakang</p>
        </div>
        {canSubmit && (
          <button
            onClick={() => setForm({ ...EMPTY_FORM, date: toDateKey() })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl text-sm font-bold shadow"
          >
            <FilePen size={16} />
            Ajukan Koreksi
          </button>
        )}
      </div>

      <DataTable columns={columns} data={rows} emptyMessage="Belum ada pengajuan koreksi" />

      <Modal isOpen={!!form} onClose={() => setForm(null)} title="Ajukan Koreksi Absensi">
        {form && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Tanggal</label>
              <input
                type="date"
                required
                max={toDateKey()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Jam Masuk</label>
                <input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Jam Pulang</label>
                <input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputClass} />
              </div>
            </div>
            <p className="text-xs text-gray-500 ml-1">Kosongkan jam yang tidak perlu dikoreksi.</p>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Alasan</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Contoh: lupa check-out karena rapat di luar kantor"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setForm(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold">
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl font-bold disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title="Tolak Koreksi Absensi">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tolak koreksi <span className="font-bold">{rejecting?.nama}</span> tanggal {rejecting?.tanggal}?
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Alasan penolakan (wajib)"
            className={`${inputClass} resize-none`}
          />
          <div className="flex gap-3">
            <button onClick={() => setRejecting(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold">
              Batal
            </button>
            <button
              onClick={handleReject}
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
