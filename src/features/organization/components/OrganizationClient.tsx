"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { PageHeader } from "@/shared/components/ui/Page";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Textarea } from "@/shared/components/ui/Form";
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
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => openForm(kind, row)}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        title="Ubah"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setDeleteTarget({ kind, id: row.id, name: row.name })}
        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        title="Hapus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const section = (kind: Kind, subtitle: string, table: React.ReactNode) => (
    <Card>
      <CardHeader
        title={KIND_LABEL[kind]}
        description={subtitle}
        action={
          <Button variant="secondary" size="sm" onClick={() => openForm(kind)}>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        }
      />
      {table}
    </Card>
  );

  const formTitle = form ? `${form.id ? "Ubah" : "Tambah"} ${KIND_LABEL[form.kind].toLowerCase()}` : "";
  const deleteTitle = deleteTarget ? `Hapus ${KIND_LABEL[deleteTarget.kind].toLowerCase()}` : "";

  return (
    <>
      <PageHeader title="Organisasi" description="Divisi dan jabatan beserta gaji pokok standarnya" />

      <div className="space-y-6">
        {section(
          "department",
          `${departments.length} divisi`,
          <DataTable
            data={departments}
            emptyMessage="Belum ada divisi"
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium text-gray-900" },
              { header: "Deskripsi", accessor: (r) => r.description || "-" },
              { header: "Karyawan", accessor: "employeeCount", className: "tabular-nums" },
              { header: "", accessor: (r) => actions("department", r) },
            ]}
          />,
        )}

        {section(
          "position",
          "Gaji standar dipakai saat karyawan baru didaftarkan",
          <DataTable
            data={positions}
            emptyMessage="Belum ada jabatan"
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium text-gray-900" },
              { header: "Gaji standar", accessor: (r) => formatCurrency(r.salaryBase), className: "tabular-nums" },
              { header: "Karyawan", accessor: "employeeCount", className: "tabular-nums" },
              { header: "", accessor: (r) => actions("position", r) },
            ]}
          />,
        )}
      </div>

      <Modal isOpen={!!form} onClose={() => setForm(null)} title={formTitle}>
        {form && (
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Nama" htmlFor="org-name" required>
              <Input id="org-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>

            {form.kind === "department" ? (
              <Field label="Deskripsi" htmlFor="org-description">
                <Textarea
                  id="org-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            ) : (
              <Field
                label="Gaji pokok standar (Rp)"
                htmlFor="org-salary"
                required
                hint="Mengubah nilai ini tidak mengubah gaji karyawan yang sudah ada."
              >
                <Input
                  id="org-salary"
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={form.salaryBase}
                  onChange={(e) => setForm({ ...form, salaryBase: Number(e.target.value) || 0 })}
                  className="tabular-nums"
                />
              </Field>
            )}

            <ModalActions>
              <Button variant="secondary" onClick={() => setForm(null)}>
                Batal
              </Button>
              <Button type="submit" loading={isSaving}>
                Simpan
              </Button>
            </ModalActions>
          </form>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTitle}
        message={`Hapus "${deleteTarget?.name}"? Hanya bisa dihapus jika tidak ada karyawan yang memakainya.`}
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
