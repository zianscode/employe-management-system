"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanySetting } from "@/shared/types/settings.types";
import { JKK_RISK_GROUPS } from "@/shared/constants/payroll";
import { getCompanySetting, updateCompanySetting } from "@/lib/api/client";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

export const CompanySettings = () => {
  const [form, setForm] = useState<CompanySetting | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCompanySetting().then((res) => {
      if (res.success && res.data) setForm(res.data);
      else toast.error(res.message);
    });
  }, []);

  if (!form) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const set = (key: keyof CompanySetting) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" || e.target.tagName === "SELECT" ? Number(e.target.value) : e.target.value;
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateCompanySetting(form);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeading title="Identitas perusahaan" description="Ditampilkan di slip gaji" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nama perusahaan" htmlFor="companyName" required>
            <Input id="companyName" required value={form.companyName} onChange={set("companyName")} />
          </FormField>
          <FormField label="Kode perusahaan" htmlFor="companyCode">
            <Input id="companyCode" value={form.companyCode ?? ""} onChange={set("companyCode")} />
          </FormField>
          <FormField label="NPWP" htmlFor="npwp">
            <Input id="npwp" value={form.npwp ?? ""} onChange={set("npwp")} />
          </FormField>
          <FormField label="Telepon" htmlFor="phone">
            <Input id="phone" value={form.phone ?? ""} onChange={set("phone")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeading title="Jam kerja dan cuti" description="Dipakai untuk menghitung absensi, cuti, dan gaji" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Jam masuk" htmlFor="workStartTime" required>
              <Input id="workStartTime" type="time" required value={form.workStartTime} onChange={set("workStartTime")} />
            </FormField>
            <FormField label="Jam pulang" htmlFor="workEndTime" required>
              <Input id="workEndTime" type="time" required value={form.workEndTime} onChange={set("workEndTime")} />
            </FormField>
          </div>
          <FormField label="Toleransi terlambat (menit)" htmlFor="lateToleranceMinutes" required>
            <Input
              id="lateToleranceMinutes"
              type="number"
              min={0}
              required
              value={form.lateToleranceMinutes}
              onChange={set("lateToleranceMinutes")}
            />
          </FormField>
          <FormField label="Tarif lembur per jam (Rp)" htmlFor="overtimeRatePerHour" required>
            <Input
              id="overtimeRatePerHour"
              type="number"
              min={0}
              step={1000}
              required
              value={form.overtimeRatePerHour}
              onChange={set("overtimeRatePerHour")}
            />
          </FormField>
          <FormField
            label="Hari kerja per bulan"
            htmlFor="workingDaysPerMonth"
            required
            hint="Pembagi potongan harian untuk cuti di luar tanggungan"
          >
            <Input
              id="workingDaysPerMonth"
              type="number"
              min={1}
              max={31}
              required
              value={form.workingDaysPerMonth}
              onChange={set("workingDaysPerMonth")}
            />
          </FormField>
          <FormField
            label="Jatah cuti tahunan (hari)"
            htmlFor="annualLeaveQuota"
            required
            hint="Berlaku untuk karyawan yang didaftarkan setelah perubahan ini"
          >
            <Input id="annualLeaveQuota" type="number" min={0} required value={form.annualLeaveQuota} onChange={set("annualLeaveQuota")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeading title="BPJS" description="Dasar perhitungan iuran BPJS Kesehatan dan Ketenagakerjaan" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Kelompok risiko JKK" htmlFor="jkkRateBps">
            <NativeSelect id="jkkRateBps" value={form.jkkRateBps} onChange={set("jkkRateBps")}>
              {JKK_RISK_GROUPS.map((g) => (
                <option key={g.bps} value={g.bps}>
                  {g.label}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Upah minimum / UMK (Rp)" htmlFor="bpjsMinimumWage" hint="Batas bawah dasar iuran. Isi 0 jika tidak dipakai.">
            <Input
              id="bpjsMinimumWage"
              type="number"
              min={0}
              step={1000}
              value={form.bpjsMinimumWage}
              onChange={set("bpjsMinimumWage")}
            />
          </FormField>
          <FormField label="Batas upah BPJS Kesehatan (Rp)" htmlFor="bpjsKesehatanWageCap" required>
            <Input
              id="bpjsKesehatanWageCap"
              type="number"
              min={0}
              step={1000}
              required
              value={form.bpjsKesehatanWageCap}
              onChange={set("bpjsKesehatanWageCap")}
            />
          </FormField>
          <FormField label="Batas upah Jaminan Pensiun (Rp)" htmlFor="jpWageCap" required hint="Disesuaikan BPJS Ketenagakerjaan setiap Maret">
            <Input id="jpWageCap" type="number" min={0} step={100} required value={form.jpWageCap} onChange={set("jpWageCap")} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          Simpan pengaturan
        </Button>
      </div>
    </form>
  );
};
