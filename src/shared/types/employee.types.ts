import type { EmployeeStatus, EmploymentType, PtkpStatus } from "@prisma/client";

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

export interface EmployeeFormData {
  name: string;
  email: string;
  nip: string;
  gender: string;
  birthDate: string;
  positionId: string;
  departmentId: string;
  roleId: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  joinDate: string;
  customPosition?: string;
  avatar?: string;
  salaryBase?: number;
  managerId?: string | null;
  ptkpStatus?: PtkpStatus;
  bpjsKesehatan?: boolean;
  bpjsKetenagakerjaan?: boolean;
}

export interface OrgOption {
  id: string;
  name: string;
}
