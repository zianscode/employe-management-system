"use client";

import React, { useEffect, useState } from "react";
import { Building2, Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { CompanySetting } from "@/shared/types/settings.types";
import { getCompanySettingAction, updateCompanySettingAction } from "@/server/modules/settings/company-setting.actions";

const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E02F75] outline-none";

export const CompanySettings = () => {
  const [form, setForm] = useState<CompanySetting | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCompanySettingAction().then((res) => {
      if (res.success && res.data) setForm(res.data);
      else toast.error(res.message);
    });
  }, []);

  if (!form) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-gray-500">Memuat pengaturan...</div>;
  }

  const set = (key: keyof CompanySetting) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateCompanySettingAction(form);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Informasi Perusahaan</h3>
            <p className="text-gray-500">Data dan identitas perusahaan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
            <input type="text" required value={form.companyName} onChange={set("companyName")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kode Perusahaan</label>
            <input type="text" value={form.companyCode ?? ""} onChange={set("companyCode")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
            <input type="text" value={form.npwp ?? ""} onChange={set("npwp")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
            <input type="text" value={form.phone ?? ""} onChange={set("phone")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Pengaturan Kerja</h3>
            <p className="text-gray-500">Dipakai untuk perhitungan absensi, cuti, dan gaji</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Masuk</label>
              <input type="time" required value={form.workStartTime} onChange={set("workStartTime")} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Pulang</label>
              <input type="time" required value={form.workEndTime} onChange={set("workEndTime")} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Toleransi Keterlambatan (menit)</label>
            <input type="number" min={0} required value={form.lateToleranceMinutes} onChange={set("lateToleranceMinutes")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tarif Lembur per Jam (Rp)</label>
            <input type="number" min={0} step={1000} required value={form.overtimeRatePerHour} onChange={set("overtimeRatePerHour")} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hari Kerja per Bulan</label>
            <input type="number" min={1} max={31} required value={form.workingDaysPerMonth} onChange={set("workingDaysPerMonth")} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Pembagi potongan gaji harian untuk cuti diluar tanggungan</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jatah Cuti Tahunan Default (hari)</label>
            <input type="number" min={0} required value={form.annualLeaveQuota} onChange={set("annualLeaveQuota")} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Berlaku untuk karyawan yang didaftarkan setelah perubahan ini</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
};
