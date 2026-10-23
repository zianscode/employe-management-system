"use client";

import React, { useState, useEffect } from "react";
import { LeaveType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { getEmployeesForLeaveAction, getLeavePreviewAction } from "@/server/modules/leave/leave.actions";
import { LeavePreview, LeaveRequestInput } from "@/shared/types/leave.types";
import { toDateKey } from "@/shared/utils/date";
import { cn } from "@/shared/utils/cn";
import { isAdminRole } from "@/shared/constants/roles";
import { ModalActions } from "@/shared/components/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Form";

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
    getLeavePreviewAction({
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
        const res = await getEmployeesForLeaveAction();
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
        <Field label="Karyawan" htmlFor="employeeId" required>
          <Select id="employeeId" name="employeeId" required value={formData.employeeId} onChange={handleChange}>
            <option value="" disabled>
              Pilih karyawan
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.nip})
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <p className="text-sm text-gray-500">
          Diajukan atas nama <span className="font-medium text-gray-900">{session?.user?.name}</span>
        </p>
      )}

      <Field label="Jenis cuti" htmlFor="type" required>
        <Select id="type" name="type" required value={formData.type} onChange={handleChange}>
          <option value="ANNUAL">Cuti tahunan</option>
          <option value="SICK">Sakit</option>
          <option value="EMERGENCY">Izin penting</option>
          <option value="UNPAID">Cuti di luar tanggungan</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mulai" htmlFor="startDate" required>
          <Input id="startDate" type="date" name="startDate" required value={formData.startDate} onChange={handleChange} />
        </Field>
        <Field label="Selesai" htmlFor="endDate" required>
          <Input id="endDate" type="date" name="endDate" required value={formData.endDate} onChange={handleChange} />
        </Field>
      </div>

      {preview && (
        <div
          className={cn(
            "rounded-md border px-4 py-3 text-sm",
            exceedsQuota ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-600",
          )}
        >
          {preview.workingDays != null && (
            <p>
              Durasi <span className="font-medium text-gray-900">{preview.workingDays} hari kerja</span>, tanpa akhir pekan dan
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

      <Field label="Alasan" htmlFor="reason" required>
        <Textarea id="reason" name="reason" required value={formData.reason} onChange={handleChange} rows={3} />
      </Field>

      <ModalActions>
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={exceedsQuota}>
          Kirim pengajuan
        </Button>
      </ModalActions>
    </form>
  );
};
