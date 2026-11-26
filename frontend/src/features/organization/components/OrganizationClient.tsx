"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { RowActions } from "@/shared/components/RowActions";
import { DataTable } from "@/shared/components/DataTable";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { PageHeader } from "@/shared/components/PageLayout";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { DepartmentRow, PositionRow } from "@/shared/types/organization.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  deleteDepartment,
  deletePosition,
  saveDepartment,
  savePosition,
} from "@/lib/api/client";

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
        ? await saveDepartment({ name: form.name, description: form.description || null }, form.id)
        : await savePosition({ name: form.name, salaryBase: form.salaryBase }, form.id);
    if (handleResult(res)) setForm(null);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    const res =
      deleteTarget.kind === "department"
        ? await deleteDepartment(deleteTarget.id)
        : await deletePosition(deleteTarget.id);
    handleResult(res);
    setDeleteTarget(null);
    setIsSaving(false);
  };

  const actions = (kind: Kind, row: DepartmentRow | PositionRow) => (
    <RowActions
      label={`Aksi untuk ${row.name}`}
      actions={[
        { label: "Ubah", icon: Pencil, onSelect: () => openForm(kind, row) },
        { label: "Hapus", icon: Trash2, onSelect: () => setDeleteTarget({ kind, id: row.id, name: row.name }), destructive: true },
      ]}
    />
  );

  const section = (kind: Kind, subtitle: string, table: React.ReactNode) => (
    <Card>
      <CardHeading
        title={KIND_LABEL[kind]}
        description={subtitle}
        action={
          <Button variant="outline" size="sm" onClick={() => openForm(kind)}>
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
            emptyIcon={Building2}
            emptyMessage="Belum ada divisi"
            emptyDescription="Tambahkan divisi seperti Keuangan, Operasional, atau IT."
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium text-foreground" },
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
            emptyIcon={Briefcase}
            emptyMessage="Belum ada jabatan"
            emptyDescription="Tambahkan jabatan beserta gaji pokok standarnya."
            columns={[
              { header: "Nama", accessor: "name", className: "font-medium text-foreground" },
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
            <FormField label="Nama" htmlFor="org-name" required>
              <Input id="org-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>

            {form.kind === "department" ? (
              <FormField label="Deskripsi" htmlFor="org-description">
                <Textarea
                  id="org-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
            ) : (
              <FormField
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
              </FormField>
            )}

            <ModalActions>
              <Button variant="outline" onClick={() => setForm(null)}>
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
