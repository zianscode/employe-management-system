"use client";

import React, { useState, useEffect } from "react";
import type { LeaveType } from "@/shared/types/workforce.types";
import { useSession } from "@/lib/api/session";
import { getEmployeesForLeave, getLeavePreview } from "@/lib/api/client";
import { LeavePreview, LeaveRequestInput } from "@/shared/types/leave.types";
import { toDateKey } from "@/shared/utils/date";
import { cn } from "@/shared/utils/cn";
import { isAdminRole } from "@/shared/constants/roles";
import { ModalActions } from "@/shared/components/Modal";
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { NativeSelect } from "@/shared/components/ui/native-select";

interface LeaveFormProps {
  onSubmit: (data: LeaveRequestInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const { data: session } = useSession();

  const isAdminOrHR = isAdminRole(session?.user?.role);
  const currentUserEmployeeId = session?.user?.employeeId;

  const [employees, setEmployees] = useState<{ id: string; name: string; nip: string }[]>([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "ANNUAL" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [preview, setPreview] = useState<LeavePreview | null>(null);

  useEffect(() => {
    if (!formData.employeeId) return;
    let cancelled = false;
    getLeavePreview({
      employeeId: formData.employeeId,
      startDate: formData.startDate || toDateKey(),
      endDate: formData.endDate || undefined,
    }).then((res) => {
      if (!cancelled) setPreview(res.success && res.data ? res.data : null);
    });
    return () => {
      cancelled = true;
    };
  }, [formData.employeeId, formData.startDate, formData.endDate]);

  const isAnnual = formData.type === "ANNUAL";
  const exceedsQuota = isAnnual && preview?.workingDays != null && preview.workingDays > preview.available;

  useEffect(() => {
    async function fetchEmployees() {
      if (!isAdminOrHR && currentUserEmployeeId) {
        setFormData((prev) => ({ ...prev, employeeId: currentUserEmployeeId }));
        return;
      }

      if (isAdminOrHR) {
        const res = await getEmployeesForLeave();
        const mappedData = res.success && res.data ? res.data : [];
        setEmployees(mappedData);
        if (mappedData.length > 0) {
          setFormData((prev) => ({ ...prev, employeeId: mappedData[0].id }));
        }
      }
    }
    fetchEmployees();
  }, [isAdminOrHR, currentUserEmployeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isAdminOrHR ? (
        <FormField label="Karyawan" htmlFor="employeeId" required>
          <NativeSelect id="employeeId" name="employeeId" required value={formData.employeeId} onChange={handleChange}>
            <option value="" disabled>
              Pilih karyawan
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.nip})
              </option>
            ))}
          </NativeSelect>
        </FormField>
      ) : (
        <p className="text-sm text-muted-foreground">
          Diajukan atas nama <span className="font-medium text-foreground">{session?.user?.name}</span>
        </p>
      )}

      <FormField label="Jenis cuti" htmlFor="type" required>
        <NativeSelect id="type" name="type" required value={formData.type} onChange={handleChange}>
          <option value="ANNUAL">Cuti tahunan</option>
          <option value="SICK">Sakit</option>
          <option value="EMERGENCY">Izin penting</option>
          <option value="UNPAID">Cuti di luar tanggungan</option>
        </NativeSelect>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Mulai" htmlFor="startDate" required>
          <Input id="startDate" type="date" name="startDate" required value={formData.startDate} onChange={handleChange} />
        </FormField>
        <FormField label="Selesai" htmlFor="endDate" required>
          <Input id="endDate" type="date" name="endDate" required value={formData.endDate} onChange={handleChange} />
        </FormField>
      </div>

      {preview && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            exceedsQuota ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/50 text-muted-foreground",
          )}
        >
          {preview.workingDays != null && (
            <p>
              Durasi <span className="font-medium text-foreground">{preview.workingDays} hari kerja</span>, tanpa akhir pekan dan
              hari libur.
            </p>
          )}
          {isAnnual && (
            <p className={preview.workingDays != null ? "mt-1" : undefined}>
              Sisa cuti tahunan {preview.year}: <span className="font-medium">{preview.available} hari</span>
              {preview.pending > 0 && <>, {preview.pending} hari masih menunggu persetujuan</>}.
              {exceedsQuota && " Sisa cuti tidak cukup untuk pengajuan ini."}
            </p>
          )}
          <p className="mt-1">
            {preview.managerName
              ? `Disetujui dulu oleh atasan (${preview.managerName}), lalu HR.`
              : "Langsung disetujui oleh HR karena belum ada atasan langsung."}
          </p>
        </div>
      )}

      <FormField label="Alasan" htmlFor="reason" required>
        <Textarea id="reason" name="reason" required value={formData.reason} onChange={handleChange} rows={3} />
      </FormField>

      <ModalActions>
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={exceedsQuota}>
          Kirim pengajuan
        </Button>
      </ModalActions>
    </form>
  );
};
