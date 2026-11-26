"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RowActions } from "@/shared/components/RowActions";
import { DataTable } from "@/shared/components/DataTable";
import { HolidayRow } from "@/shared/types/settings.types";
import { toDateKey } from "@/shared/utils/date";
import { createHoliday, deleteHoliday, getHolidays } from "@/lib/api/client";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export function HolidaySettings() {
  const [year, setYear] = useState(() => Number(toDateKey().slice(0, 4)));
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [form, setForm] = useState({ date: "", name: "" });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await getHolidays(year);
    if (res.success && res.data) setHolidays(res.data);
    else toast.error(res.message);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await createHoliday(form);
    if (res.success) {
      toast.success(res.message);
      setForm({ date: "", name: "" });
      if (Number(form.date.slice(0, 4)) === year) await load();
      else setYear(Number(form.date.slice(0, 4)));
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (holiday: HolidayRow) => {
    const res = await deleteHoliday(holiday.id);
    if (res.success) {
      toast.success(res.message);
      await load();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card>
      <CardHeading
        title="Hari libur"
        description="Tanggal merah dan cuti bersama tidak dihitung sebagai hari kerja"
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="holiday-year" className="text-sm text-muted-foreground">
              Tahun
            </label>
            <Input
              id="holiday-year"
              type="number"
              value={year}
              min={2000}
              max={2100}
              onChange={(e) => e.target.value && setYear(Number(e.target.value))}
              className="h-8 w-24"
            />
          </div>
        }
      />

      <form onSubmit={handleAdd} className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
        <Input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="sm:w-44"
        />
        <Input
          required
          placeholder="Nama hari libur, misal Hari Kemerdekaan RI"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1"
        />
        <Button type="submit" variant="outline" loading={isSaving}>
          Tambah
        </Button>
      </form>

      <DataTable
        data={holidays}
        emptyIcon={CalendarOff}
        emptyMessage={`Belum ada hari libur untuk tahun ${year}`}
        emptyDescription="Tambahkan tanggal merah dan cuti bersama lewat form di atas."
        columns={[
          { header: "Keterangan", accessor: "name", className: "font-medium text-foreground" },
          { header: "Tanggal", accessor: "date", className: "tabular-nums" },
          {
            header: "",
            accessor: (h: HolidayRow) => (
              <RowActions
                label={`Aksi untuk ${h.name}`}
                actions={[{ label: "Hapus hari libur", icon: Trash2, onSelect: () => handleDelete(h), destructive: true }]}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
