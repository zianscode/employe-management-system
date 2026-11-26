"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PayrollComponentRow } from "@/shared/types/salary.types";
import { formatCurrency } from "@/shared/utils/format";
import {
  addPayrollComponent,
  deletePayrollComponent,
  getPayrollComponents,
} from "@/lib/api/client";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

const TYPE_LABEL: Record<PayrollComponentRow["type"], string> = {
  ALLOWANCE: "Tunjangan",
  DEDUCTION: "Potongan",
};

export function PayrollComponentsCard({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<PayrollComponentRow[]>([]);
  const [form, setForm] = useState({ name: "", type: "ALLOWANCE" as PayrollComponentRow["type"], amount: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await getPayrollComponents(employeeId);
    if (res.success && res.data) setRows(res.data);
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await addPayrollComponent(employeeId, form);
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
    const res = await deletePayrollComponent(id);
    if (res.success) await load();
    else toast.error(res.message);
  };

  const total = (type: PayrollComponentRow["type"]) =>
    rows.filter((r) => r.type === type).reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <CardHeading
        title="Komponen gaji tetap"
        description="Tunjangan ikut dihitung ke dasar BPJS dan PPh 21. Potongan dikurangkan dari gaji bersih."
      />
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada tunjangan atau potongan.</p>
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{row.name}</span>
                  <Badge variant={row.type === "ALLOWANCE" ? "success" : "destructive"}>{TYPE_LABEL[row.type]}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-foreground">{formatCurrency(row.amount)}</span>
<Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(row.id)}
                    aria-label={`Hapus ${row.name}`}
                    title="Hapus"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-6 bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
              <span>
                Tunjangan <span className="font-medium tabular-nums text-foreground">{formatCurrency(total("ALLOWANCE"))}</span>
              </span>
              <span>
                Potongan <span className="font-medium tabular-nums text-foreground">{formatCurrency(total("DEDUCTION"))}</span>
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
          <NativeSelect
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as PayrollComponentRow["type"] })}
            className="sm:w-36"
          >
            <option value="ALLOWANCE">Tunjangan</option>
            <option value="DEDUCTION">Potongan</option>
          </NativeSelect>
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
          <Button type="submit" variant="outline" loading={isSaving}>
            Tambah
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
