"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EmployeeStatus } from "@/shared/types/workforce.types";

import { getOrgData } from "@/lib/api/client";
import { ROLE_DESCRIPTIONS, ROLES, RoleName } from "@/shared/constants/roles";
import { PTKP_OPTIONS } from "@/shared/constants/payroll";
import { getRoles } from "@/lib/api/client";
import { EmployeeFormData, OrgOption } from "@/shared/types/employee.types";
import { PageHeader } from "@/shared/components/PageLayout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  title: string;
  isSubmitting?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSubmit, title, isSubmitting = false }) => {
  const router = useRouter();
  const [orgData, setOrgData] = useState<{
    departments: OrgOption[];
    positions: OrgOption[];
    managers: OrgOption[];
    roles: OrgOption[];
  }>({
    departments: [],
    positions: [],
    managers: [],
    roles: [],
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    nip: initialData?.nip || "",
    gender: initialData?.gender || "MALE",
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split("T")[0] : "",
    positionId: initialData?.positionId || "",
    departmentId: initialData?.departmentId || "",
    roleId: initialData?.roleId || "",
    status: (initialData?.status as EmployeeStatus) || "ACTIVE",
    employmentType: initialData?.employmentType || "FULL_TIME",
    joinDate: initialData?.joinDate || new Date().toISOString().split("T")[0],
    customPosition: "",
    salaryBase: initialData?.salaryBase || 0,
    managerId: initialData?.managerId || "",
    ptkpStatus: initialData?.ptkpStatus || "TK0",
    bpjsKesehatan: initialData?.bpjsKesehatan ?? true,
    bpjsKetenagakerjaan: initialData?.bpjsKetenagakerjaan ?? true,
  });

  useEffect(() => {
    if (!initialData?.nip && formData.birthDate && formData.joinDate && formData.gender) {
      const bDate = formData.birthDate.replace(/-/g, "");
      const jDate = formData.joinDate.replace(/-/g, "").substring(0, 6);
      const genderCode = formData.gender === "MALE" ? "1" : "2";
      const sequence = "001";
      setFormData((prev) => ({ ...prev, nip: `${bDate}${jDate}${genderCode}${sequence}` }));
    }
  }, [formData.birthDate, formData.joinDate, formData.gender, initialData?.nip]);

  useEffect(() => {
    if (formData.positionId && formData.positionId !== "OTHER") {
      const selectedPos = orgData.positions.find((p) => p.id === formData.positionId);
      if (selectedPos) {
        const mapping: Record<string, string> = {
          "Chief Executive Officer": "Direksi",
          "Lead Developer": "Teknologi Informasi",
          "HR Manager": "Sumber Daya Manusia",
        };
        const targetDeptName = mapping[selectedPos.name];
        if (targetDeptName) {
          const targetDept = orgData.departments.find((d) => d.name === targetDeptName);
          if (targetDept) {
            setFormData((prev) => ({ ...prev, departmentId: targetDept.id }));
          }
        }
      }
    }
  }, [formData.positionId, orgData.positions, orgData.departments]);

  useEffect(() => {
    const fetchOrgData = async () => {
      const data = await getOrgData();
      const rolesRes = await getRoles();
      const rolesData = rolesRes.success && rolesRes.data ? rolesRes.data : [];

      setOrgData({ ...data, roles: rolesData });

      if (!initialData) {
        const empRole = rolesData.find((r) => r.name === ROLES.EMPLOYEE);
        if (empRole) setFormData((prev) => ({ ...prev, roleId: empRole.id }));
      }
    };
    fetchOrgData();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "salaryBase" ? Number(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, managerId: formData.managerId || null });
  };

  const selectedRoleName = orgData.roles.find((r) => r.id === formData.roleId)?.name as RoleName | undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title={title}
        description="Data dengan tanda * wajib diisi"
        back={
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-muted-foreground">
            <ArrowLeft />
            Kembali
          </Button>
        }
      />

      <Card>
        <CardHeading title="Data pribadi" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nama lengkap" htmlFor="name" required>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Budi Santoso" />
          </FormField>
          <FormField label="Email kantor" htmlFor="email" required>
            <Input id="email" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="budi@perusahaan.com" />
          </FormField>
          <FormField label="Jenis kelamin" htmlFor="gender">
            <NativeSelect id="gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </NativeSelect>
          </FormField>
          <FormField label="Tanggal lahir" htmlFor="birthDate" required>
            <Input id="birthDate" type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} />
          </FormField>
          <FormField label="NIP" htmlFor="nip" hint="Dibuat otomatis dari tanggal lahir, tanggal bergabung, dan jenis kelamin">
            <Input id="nip" name="nip" readOnly disabled value={formData.nip} className="tabular-nums" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeading title="Pekerjaan" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Jabatan" htmlFor="positionId" required>
            <NativeSelect id="positionId" name="positionId" required value={formData.positionId} onChange={handleChange}>
              <option value="" disabled>
                Pilih jabatan
              </option>
              {orgData.positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="OTHER">Lainnya</option>
            </NativeSelect>
          </FormField>
          {formData.positionId === "OTHER" && (
            <FormField label="Nama jabatan baru" htmlFor="customPosition" required>
              <Input
                id="customPosition"
                name="customPosition"
                required
                value={formData.customPosition}
                onChange={handleChange}
                placeholder="Misal: Staff Gudang"
              />
            </FormField>
          )}
          <FormField label="Divisi" htmlFor="departmentId">
            <NativeSelect id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange}>
              <option value="" disabled>
                Pilih divisi
              </option>
              {orgData.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Tipe kerja" htmlFor="employmentType" required>
            <NativeSelect id="employmentType" name="employmentType" required value={formData.employmentType} onChange={handleChange}>
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="CONTRACT">Kontrak</option>
              <option value="INTERNSHIP">Magang</option>
              <option value="REMOTE">Remote</option>
              <option value="FREELANCE">Freelance</option>
            </NativeSelect>
          </FormField>
          <FormField label="Status" htmlFor="status">
            <NativeSelect id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">Aktif</option>
              <option value="PROBATION">Masa percobaan</option>
              <option value="RESIGNED">Resign</option>
              <option value="TERMINATED">Diberhentikan</option>
            </NativeSelect>
          </FormField>
          <FormField label="Tanggal bergabung" htmlFor="joinDate" required>
            <Input id="joinDate" type="date" name="joinDate" required value={formData.joinDate} onChange={handleChange} />
          </FormField>
          <FormField label="Atasan langsung" htmlFor="managerId" hint="Atasan menyetujui cuti lebih dulu sebelum HR">
            <NativeSelect id="managerId" name="managerId" value={formData.managerId || ""} onChange={handleChange}>
              <option value="">Tidak ada</option>
              {orgData.managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField
            label="Hak akses"
            htmlFor="roleId"
            required
            hint={selectedRoleName ? ROLE_DESCRIPTIONS[selectedRoleName] : undefined}
          >
            <NativeSelect id="roleId" name="roleId" required value={formData.roleId} onChange={handleChange}>
              <option value="" disabled>
                Pilih hak akses
              </option>
              {orgData.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeading title="Gaji dan pajak" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Gaji pokok (Rp)" htmlFor="salaryBase" hint="Kosongkan untuk memakai gaji standar jabatan">
            <Input
              id="salaryBase"
              type="number"
              name="salaryBase"
              min={0}
              step={1000}
              value={formData.salaryBase || ""}
              onChange={handleChange}
              className="tabular-nums"
            />
          </FormField>
          <FormField label="Status PTKP" htmlFor="ptkpStatus">
            <NativeSelect id="ptkpStatus" name="ptkpStatus" value={formData.ptkpStatus} onChange={handleChange}>
              {PTKP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Kepesertaan BPJS</legend>
            <div className="space-y-2">
              {(
                [
                  ["bpjsKesehatan", "BPJS Kesehatan"],
                  ["bpjsKetenagakerjaan", "BPJS Ketenagakerjaan (JHT, JP, JKK, JKM)"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={field}
                    checked={formData[field]}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, [field]: checked === true }))}
                  />
                  <Label htmlFor={field} className="font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? "Simpan perubahan" : "Simpan karyawan"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
