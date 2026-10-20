"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Modal } from "@/shared/components/Modal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DepartmentRow, PositionRow } from "@/shared/types/organization.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  deleteDepartmentAction,
  deletePositionAction,
  saveDepartmentAction,
  savePositionAction,
} from "@/server/modules/organization/organization.actions";

type Kind = "department" | "position";

interface FormState {
  kind: Kind;
  id?: string;
  name: string;
  description: string;
  salaryBase: number;
}

interface DeleteTarget {
  kind: Kind;
  id: string;
  name: string;
}

const KIND_LABEL: Record<Kind, string> = { department: "Divisi", position: "Jabatan" };

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium";

interface OrganizationClientProps {
  departments: DepartmentRow[];
  positions: PositionRow[];
}

export function OrganizationClient({ departments, positions }: OrganizationClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openForm = (kind: Kind, row?: DepartmentRow | PositionRow) =>
    setForm({
      kind,
      id: row?.id,
      name: row?.name ?? "",
      description: row && "description" in row ? row.description ?? "" : "",
      salaryBase: row && "salaryBase" in row ? row.salaryBase : 0,
    });

  const handleResult = (res: { success: boolean; message: string }) => {
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    return res.success;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setIsSaving(true);
    const res =
      form.kind === "department"
        ? await saveDepartmentAction({ name: form.name, description: form.description || null }, form.id)
        : await savePositionAction({ name: form.name, salaryBase: form.salaryBase }, form.id);
    if (handleResult(res)) setForm(null);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    const res =
      deleteTarget.kind === "department"
        ? await deleteDepartmentAction(deleteTarget.id)
        : await deletePositionAction(deleteTarget.id);
    handleResult(res);
    setDeleteTarget(null);
    setIsSaving(false);
  };

  const actions = (kind: Kind, row: DepartmentRow | PositionRow) => (
    <div className="flex gap-2">
      <button onClick={() => openForm(kind, row)} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Ubah">
        <Pencil size={16} />
      </button>
      <button
        onClick={() => setDeleteTarget({ kind, id: row.id, name: row.name })}
        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        title="Hapus"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const section = (kind: Kind, subtitle: string, table: React.ReactNode) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{KIND_LABEL[kind]}</h2>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
        <button
          onClick={() => openForm(kind)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-xl text-sm font-bold shadow"
        >
          <Plus size={16} />
          Tambah {KIND_LABEL[kind]}
        </button>
      </div>
      {table}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white tracking-tight">Struktur Organisasi</h1>
        <p className="text-white/80 mt-1 text-sm font-medium">Kelola divisi dan jabatan beserta gaji pokok standarnya</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {section(
          "department",
          `${departments.length} divisi`,
          <DataTable
            data={departments}
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium" },
              { header: "Deskripsi", accessor: (r) => r.description || "-" },
              { header: "Karyawan Aktif", accessor: "employeeCount" },
              { header: "Aksi", accessor: (r) => actions("department", r) },
            ]}
          />
        )}

        {section(
          "position",
          "Gaji pokok standar dipakai saat karyawan baru didaftarkan",
          <DataTable
            data={positions}
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium" },
              { header: "Gaji Pokok Standar", accessor: (r) => formatCurrency(r.salaryBase) },
              { header: "Karyawan Aktif", accessor: "employeeCount" },
              { header: "Aksi", accessor: (r) => actions("position", r) },
            ]}
          />
        )}
      </div>

      <Modal
        isOpen={!!form}
        onClose={() => setForm(null)}
        title={form ? `${form.id ? "Ubah" : "Tambah"} ${KIND_LABEL[form.kind]}` : ""}
      >
        {form && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Nama {KIND_LABEL[form.kind]}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            {form.kind === "department" ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Gaji Pokok Standar (Rp)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={form.salaryBase}
                  onChange={(e) => setForm({ ...form, salaryBase: Number(e.target.value) || 0 })}
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 ml-1">
                  Mengubah nilai ini tidak mengubah gaji karyawan yang sudah ada.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setForm(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold">
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-2xl font-bold disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Hapus ${deleteTarget ? KIND_LABEL[deleteTarget.kind] : ""}`}
        message={`Hapus "${deleteTarget?.name}"? Hanya bisa dihapus jika tidak ada karyawan yang memakainya.`}
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
