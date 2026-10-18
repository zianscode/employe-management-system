import type { EmployeeStatus, EmploymentType } from "@prisma/client";

/** Baris pada tabel daftar karyawan */
export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  position: string;
  division: string;
  status: string;
  joinDate: string;
  avatar: string;
  probationDaysLeft?: number | null;
}

/** Data form tambah / edit karyawan */
export interface EmployeeFormData {
  name: string;
  email: string;
  nip: string;
  gender: string;
  /** "YYYY-MM-DD" */
  birthDate: string;
  positionId: string;
  departmentId: string;
  roleId: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  /** "YYYY-MM-DD" */
  joinDate: string;
  customPosition?: string;
  avatar?: string;
  /** Gaji pokok (rupiah). 0 / kosong = pakai gaji pokok standar jabatan */
  salaryBase?: number;
  /** Atasan langsung (Employee.id) yang menyetujui cuti tahap manager */
  managerId?: string | null;
}

export interface OrgOption {
  id: string;
  name: string;
}
