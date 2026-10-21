"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PayrollComponentRow } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  addPayrollComponentAction,
  deletePayrollComponentAction,
  getPayrollComponentsAction,
} from "@/server/modules/salary/payroll-component.actions";

const TYPE_LABEL: Record<PayrollComponentRow["type"], string> = {
  ALLOWANCE: "Tunjangan",
  DEDUCTION: "Potongan",
};

const inputClass = "px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-brand/50 outline-none";

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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand/10 text-brand">
          <Wallet size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900">Komponen Gaji Tetap</h2>
          <p className="text-sm text-gray-500">
            Tunjangan ikut menjadi dasar BPJS & PPh 21. Potongan (mis. cicilan koperasi) dipotong dari gaji bersih.
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {rows.length === 0 && <p className="text-sm text-gray-400 py-2">Belum ada komponen gaji.</p>}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{row.name}</p>
              <p className={`text-xs ${row.type === "ALLOWANCE" ? "text-green-600" : "text-red-500"}`}>{TYPE_LABEL[row.type]}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-900">{formatCurrency(row.amount)}</span>
              <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="flex gap-6 text-sm">
          <span className="text-gray-500">Total tunjangan: <b className="text-gray-900">{formatCurrency(total("ALLOWANCE"))}</b></span>
          <span className="text-gray-500">Total potongan: <b className="text-gray-900">{formatCurrency(total("DEDUCTION"))}</b></span>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as PayrollComponentRow["type"] })}
          className={inputClass}
        >
          <option value="ALLOWANCE">Tunjangan</option>
          <option value="DEDUCTION">Potongan</option>
        </select>
        <input
          required
          placeholder="Nama, contoh: Tunjangan Transport"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${inputClass} flex-1`}
        />
        <input
          type="number"
          required
          min={1}
          step={1000}
          placeholder="Nominal"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
          className={`${inputClass} md:w-44`}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl font-bold disabled:opacity-50"
        >
          <Plus size={16} />
          Tambah
        </button>
      </form>
    </div>
  );
}
