"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeStatus } from "@prisma/client";

import { getOrgDataAction } from "@/server/modules/organization/organization.actions";
import { ROLE_DESCRIPTIONS, ROLES, RoleName } from "@/shared/constants/roles";
import { PTKP_OPTIONS } from "@/shared/constants/payroll";
import { getRolesAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData, OrgOption } from "@/shared/types/employee.types";
import { PageHeader } from "@/shared/components/ui/Page";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Field, Input, Select } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";

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
      const data = await getOrgDataAction();
      const rolesRes = await getRolesAction();
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
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        }
      />

      <Card>
        <CardHeader title="Data pribadi" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" htmlFor="name" required>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Budi Santoso" />
          </Field>
          <Field label="Email kantor" htmlFor="email" required>
            <Input id="email" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="budi@perusahaan.com" />
          </Field>
          <Field label="Jenis kelamin" htmlFor="gender">
            <Select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </Select>
          </Field>
          <Field label="Tanggal lahir" htmlFor="birthDate" required>
            <Input id="birthDate" type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} />
          </Field>
          <Field label="NIP" htmlFor="nip" hint="Dibuat otomatis dari tanggal lahir, tanggal bergabung, dan jenis kelamin">
            <Input id="nip" name="nip" readOnly disabled value={formData.nip} className="tabular-nums" />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pekerjaan" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Jabatan" htmlFor="positionId" required>
            <Select id="positionId" name="positionId" required value={formData.positionId} onChange={handleChange}>
              <option value="" disabled>
                Pilih jabatan
              </option>
              {orgData.positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="OTHER">Lainnya</option>
            </Select>
          </Field>
          {formData.positionId === "OTHER" && (
            <Field label="Nama jabatan baru" htmlFor="customPosition" required>
              <Input
                id="customPosition"
                name="customPosition"
                required
                value={formData.customPosition}
                onChange={handleChange}
                placeholder="Misal: Staff Gudang"
              />
            </Field>
          )}
          <Field label="Divisi" htmlFor="departmentId">
            <Select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange}>
              <option value="" disabled>
                Pilih divisi
              </option>
              {orgData.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipe kerja" htmlFor="employmentType" required>
            <Select id="employmentType" name="employmentType" required value={formData.employmentType} onChange={handleChange}>
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="CONTRACT">Kontrak</option>
              <option value="INTERNSHIP">Magang</option>
              <option value="REMOTE">Remote</option>
              <option value="FREELANCE">Freelance</option>
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">Aktif</option>
              <option value="PROBATION">Masa percobaan</option>
              <option value="RESIGNED">Resign</option>
              <option value="TERMINATED">Diberhentikan</option>
            </Select>
          </Field>
          <Field label="Tanggal bergabung" htmlFor="joinDate" required>
            <Input id="joinDate" type="date" name="joinDate" required value={formData.joinDate} onChange={handleChange} />
          </Field>
          <Field label="Atasan langsung" htmlFor="managerId" hint="Atasan menyetujui cuti lebih dulu sebelum HR">
            <Select id="managerId" name="managerId" value={formData.managerId || ""} onChange={handleChange}>
              <option value="">Tidak ada</option>
              {orgData.managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Hak akses"
            htmlFor="roleId"
            required
            hint={selectedRoleName ? ROLE_DESCRIPTIONS[selectedRoleName] : undefined}
          >
            <Select id="roleId" name="roleId" required value={formData.roleId} onChange={handleChange}>
              <option value="" disabled>
                Pilih hak akses
              </option>
              {orgData.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Gaji dan pajak" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Gaji pokok (Rp)" htmlFor="salaryBase" hint="Kosongkan untuk memakai gaji standar jabatan">
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
          </Field>
          <Field label="Status PTKP" htmlFor="ptkpStatus">
            <Select id="ptkpStatus" name="ptkpStatus" value={formData.ptkpStatus} onChange={handleChange}>
              {PTKP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-gray-700">Kepesertaan BPJS</legend>
            <div className="space-y-2">
              {(
                [
                  ["bpjsKesehatan", "BPJS Kesehatan"],
                  ["bpjsKetenagakerjaan", "BPJS Ketenagakerjaan (JHT, JP, JKK, JKM)"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData[field]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 accent-brand"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
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
