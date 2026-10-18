"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { Employee, EmployeeFormData, OrgOption } from "@/shared/types/employee.types";
import { dateToDateKey } from "@/shared/utils/date";
import { EmployeeService, EmployeeFilters } from "./employee.service";

const service = new EmployeeService();
const PROBATION_MONTHS = 3;

export async function getRolesAction() {
  try {
    await requireRole(ADMIN_ROLES);
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    return ApiResponse.success<OrgOption[]>("Roles fetched", roles.map((r) => ({ id: r.id, name: r.name })));
  } catch (error) {
    return ApiResponse.fromError<OrgOption[]>(error, "Gagal mengambil data role");
  }
}

export async function getEmployeesAction(filters?: EmployeeFilters) {
  try {
    await requireRole(ADMIN_ROLES);
    const rawData = await service.getAllEmployees(filters);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: Employee[] = rawData.map((emp) => {
      let probationDaysLeft: number | null = null;
      if (emp.status === "PROBATION" && emp.joinDate) {
        const probationEnd = new Date(emp.joinDate);
        probationEnd.setMonth(probationEnd.getMonth() + PROBATION_MONTHS);
        probationEnd.setHours(0, 0, 0, 0);
        probationDaysLeft = Math.ceil((probationEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        nip: emp.nip || "-",
        status: emp.status,
        division: emp.department?.name || "-",
        position: emp.position?.name || "-",
        joinDate: emp.joinDate ? emp.joinDate.toLocaleDateString("id-ID", { timeZone: "UTC" }) : "-",
        avatar: emp.avatar || "",
        probationDaysLeft,
      };
    });

    return ApiResponse.success("Employees fetched successfully", data);
  } catch (error) {
    return ApiResponse.fromError<Employee[]>(error, "Gagal mengambil data karyawan");
  }
}

/** Detail karyawan untuk halaman detail & form edit (tanpa data sensitif akun) */
export async function getEmployeeByIdAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    const emp = await service.getEmployeeDetail(id);
    const { user, department, position, manager, ...fields } = emp;

    return ApiResponse.success("Employee fetched", {
      ...fields,
      birthDate: emp.birthDate ? dateToDateKey(emp.birthDate) : "",
      joinDate: emp.joinDate ? dateToDateKey(emp.joinDate) : "",
      nip: emp.nip || "",
      division: department?.name || "-",
      position: position?.name || "-",
      roleId: user?.roleId || "",
      managerName: manager?.name || null,
    });
  } catch (error) {
    return ApiResponse.fromError(error, "Karyawan tidak ditemukan");
  }
}

export async function createEmployeeAction(data: EmployeeFormData) {
  try {
    await requireRole(ADMIN_ROLES);
    const { employee, defaultPassword } = await service.registerEmployee(data);
    revalidatePath("/dashboard/employees");
    return ApiResponse.success(`Karyawan berhasil dibuat. Password default: ${defaultPassword}`, { id: employee.id });
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal membuat karyawan");
  }
}

export async function updateEmployeeAction(id: string, data: EmployeeFormData) {
  try {
    await requireRole(ADMIN_ROLES);
    await service.updateEmployee(id, data);
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Data karyawan berhasil diperbarui");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui data karyawan");
  }
}

export async function promoteEmployeeAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    await service.updateEmployee(id, { status: "ACTIVE" });
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Karyawan berhasil dipromosikan menjadi aktif");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mempromosikan karyawan");
  }
}

export async function deleteEmployeeAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await service.removeEmployee(id, current.userId);
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Karyawan berhasil dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus karyawan");
  }
}
