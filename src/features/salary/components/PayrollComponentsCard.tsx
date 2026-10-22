"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PayrollComponentRow } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  addPayrollComponentAction,
  deletePayrollComponentAction,
  getPayrollComponentsAction,
} from "@/server/modules/salary/payroll-component.actions";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Input, Select } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";

const TYPE_LABEL: Record<PayrollComponentRow["type"], string> = {
  ALLOWANCE: "Tunjangan",
  DEDUCTION: "Potongan",
};

export function PayrollComponentsCard({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<PayrollComponentRow[]>([]);
  const [form, setForm] = useState({ name: "", type: "ALLOWANCE" as PayrollComponentRow["type"], amount: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await getPayrollComponentsAction(employeeId);
    if (res.success && res.data) setRows(res.data);
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await addPayrollComponentAction(employeeId, form);
    if (res.success) {
      toast.success(res.message);
      setForm({ name: "", type: form.type, amount: 0 });
      await load();
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deletePayrollComponentAction(id);
    if (res.success) await load();
    else toast.error(res.message);
  };

  const total = (type: PayrollComponentRow["type"]) =>
    rows.filter((r) => r.type === type).reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <CardHeader
        title="Komponen gaji tetap"
        description="Tunjangan ikut dihitung ke dasar BPJS dan PPh 21. Potongan dikurangkan dari gaji bersih."
      />
      <CardBody className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada tunjangan atau potongan.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{row.name}</span>
                  <Badge tone={row.type === "ALLOWANCE" ? "green" : "red"}>{TYPE_LABEL[row.type]}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-gray-900">{formatCurrency(row.amount)}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-6 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
              <span>
                Tunjangan <span className="font-medium tabular-nums text-gray-900">{formatCurrency(total("ALLOWANCE"))}</span>
              </span>
              <span>
                Potongan <span className="font-medium tabular-nums text-gray-900">{formatCurrency(total("DEDUCTION"))}</span>
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as PayrollComponentRow["type"] })}
            className="sm:w-36"
          >
            <option value="ALLOWANCE">Tunjangan</option>
            <option value="DEDUCTION">Potongan</option>
          </Select>
          <Input
            required
            placeholder="Nama komponen, misal Tunjangan Transport"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1"
          />
          <Input
            type="number"
            required
            min={1}
            step={1000}
            placeholder="Nominal"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
            className="tabular-nums sm:w-40"
          />
          <Button type="submit" variant="secondary" loading={isSaving}>
            Tambah
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
