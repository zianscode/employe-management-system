import type { Employee, EmployeeFormData, OrgOption } from "@/shared/types/employee.types";
import type { EmployeeHistory } from "@/shared/types/history.types";
import type { DepartmentRow, PositionRow } from "@/shared/types/organization.types";
import type { PasswordData, ProfileData } from "@/shared/types/profile.types";
import type { CompanySetting, HolidayRow, SystemUser } from "@/shared/types/settings.types";

import { request, type Transport } from "./transport";

const idPart = encodeURIComponent;
type EmployeeDetail = Omit<EmployeeFormData, "gender" | "positionId" | "departmentId"> & {
  id: string;
  gender: string | null;
  positionId: string | null;
  departmentId: string | null;
};
type OrganizationOptions = { departments: OrgOption[]; positions: OrgOption[]; managers: OrgOption[] };

export function hrAPI(transport: Transport) {
  const rest = <T>(path: string, method = "GET", body?: unknown) => request<T>(transport, path, method, body);
  return {
    getEmployees: (filters?: { departmentId?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (filters?.departmentId) query.set("departmentId", filters.departmentId);
      if (filters?.status) query.set("status", filters.status);
      return rest<Employee[]>(`/employees${query.size ? `?${query}` : ""}`);
    },
    getEmployeeById: (id: string) => rest<EmployeeDetail>(`/employees/${idPart(id)}`),
    getEmployeeHistory: (id: string) => rest<EmployeeHistory>(`/employees/${idPart(id)}/history`),
    createEmployee: (data: EmployeeFormData) => rest<{ id: string; temporaryPassword: string }>("/employees", "POST", data),
    updateEmployee: (id: string, data: EmployeeFormData) => rest(`/employees/${idPart(id)}`, "PATCH", data),
    deleteEmployee: (id: string) => rest(`/employees/${idPart(id)}`, "DELETE"),
    promoteEmployee: (id: string) => rest(`/employees/${idPart(id)}/activate`, "POST"),
    getRoles: () => rest<OrgOption[]>("/roles"),
    getUsers: () => rest<SystemUser[]>("/users"),
    resetUserPassword: (id: string) => rest<{ temporaryPassword: string }>(`/users/${idPart(id)}/reset-password`, "POST"),
    unlockUser: (id: string) => rest(`/users/${idPart(id)}/unlock`, "POST"),
    getOrgData: async () => {
      const response = await rest<OrganizationOptions>("/organization/form-options");
      return response.data ?? { departments: [], positions: [], managers: [] };
    },
    getOrganization: () => rest<{ departments: DepartmentRow[]; positions: PositionRow[] }>("/organization"),
    saveDepartment: (data: { name: string; description?: string | null }, id?: string) =>
      rest(id ? `/departments/${idPart(id)}` : "/departments", id ? "PATCH" : "POST", data),
    deleteDepartment: (id: string) => rest(`/departments/${idPart(id)}`, "DELETE"),
    savePosition: (data: { name: string; salaryBase: number }, id?: string) =>
      rest(id ? `/positions/${idPart(id)}` : "/positions", id ? "PATCH" : "POST", data),
    deletePosition: (id: string) => rest(`/positions/${idPart(id)}`, "DELETE"),
    getCompanySetting: () => rest<CompanySetting>("/company-settings"),
    updateCompanySetting: (data: CompanySetting) => {
      const { id: _id, ...input } = data;
      void _id;
      return rest("/company-settings", "PATCH", input);
    },
    getHolidays: (year: number) => rest<HolidayRow[]>(`/holidays?year=${year}`),
    getUpcomingHolidays: (limit = 5) => rest<HolidayRow[]>(`/holidays/upcoming?limit=${limit}`),
    createHoliday: (data: { date: string; name: string }) => rest("/holidays", "POST", data),
    deleteHoliday: (id: string) => rest(`/holidays/${idPart(id)}`, "DELETE"),
    getProfile: () => rest<ProfileData>("/me"),
    updateProfile: (data: ProfileData) => {
      const { idKaryawan, departemen, jabatan, tanggalBergabung, ...input } = data;
      void [idKaryawan, departemen, jabatan, tanggalBergabung];
      return rest("/me", "PATCH", input);
    },
    updatePassword: (data: PasswordData) => rest("/auth/password/change", "POST", data),
    completeOnboarding: (data: FormData) => rest<{ avatar: string | null }>("/me/onboarding", "POST", Object.fromEntries(data)),
    forgotPassword: (email: string) => rest("/auth/password/forgot", "POST", { email }),
    validateResetToken: (token: string) => rest<{ email: string }>("/auth/password/reset/validate", "POST", { token }),
    resetPassword: (token: string, newPassword: string) => rest("/auth/password/reset", "POST", { token, newPassword }),
  };
}
