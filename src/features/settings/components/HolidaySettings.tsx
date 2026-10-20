"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/DataTable";
import { HolidayRow } from "@/shared/types/settings.types";
import { toDateKey } from "@/shared/utils/date";
import { createHolidayAction, deleteHolidayAction, getHolidaysAction } from "@/server/modules/settings/holiday.actions";

const inputClass = "px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E02F75] outline-none";

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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
          <CalendarOff className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Hari Libur</h3>
          <p className="text-gray-500">
            Tanggal merah & cuti bersama tidak dihitung sebagai hari kerja (absensi, durasi cuti, potongan gaji).
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          required
          placeholder="Nama hari libur, contoh: Hari Kemerdekaan RI"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg font-bold disabled:opacity-50"
        >
          <Plus size={16} />
          Tambah
        </button>
      </form>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Tahun</label>
        <input
          type="number"
          value={year}
          min={2000}
          max={2100}
          onChange={(e) => e.target.value && setYear(Number(e.target.value))}
          className={`${inputClass} w-28 py-2`}
        />
      </div>

      <DataTable
        data={holidays}
        emptyMessage={`Belum ada hari libur untuk tahun ${year}`}
        columns={[
          { header: "Tanggal", accessor: "date" },
          { header: "Keterangan", accessor: "name", className: "font-medium" },
          {
            header: "Aksi",
            accessor: (h: HolidayRow) => (
              <button onClick={() => handleDelete(h)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus">
                <Trash2 size={16} />
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
