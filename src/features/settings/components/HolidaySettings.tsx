"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/DataTable";
import { HolidayRow } from "@/shared/types/settings.types";
import { toDateKey } from "@/shared/utils/date";
import { createHolidayAction, deleteHolidayAction, getHolidaysAction } from "@/server/modules/settings/holiday.actions";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";

export function HolidaySettings() {
  const [year, setYear] = useState(() => Number(toDateKey().slice(0, 4)));
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [form, setForm] = useState({ date: "", name: "" });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await getHolidaysAction(year);
    if (res.success && res.data) setHolidays(res.data);
    else toast.error(res.message);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await createHolidayAction(form);
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
    const res = await deleteHolidayAction(holiday.id);
    if (res.success) {
      toast.success(res.message);
      await load();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Hari libur"
        description="Tanggal merah dan cuti bersama tidak dihitung sebagai hari kerja"
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="holiday-year" className="text-sm text-gray-500">
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

      <form onSubmit={handleAdd} className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row">
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
        <Button type="submit" variant="secondary" loading={isSaving}>
          Tambah
        </Button>
      </form>

      <DataTable
        data={holidays}
        emptyMessage={`Belum ada hari libur untuk tahun ${year}`}
        columns={[
          { header: "Tanggal", accessor: "date" },
          { header: "Keterangan", accessor: "name", className: "font-medium text-gray-900" },
          {
            header: "",
            accessor: (h: HolidayRow) => (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(h)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
