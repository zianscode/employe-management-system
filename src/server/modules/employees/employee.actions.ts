"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { Employee, EmployeeFormData, OrgOption } from "@/shared/types/employee.types";
import { dateToDateKey } from "@/shared/utils/date";
import { getProbationDaysLeft } from "@/shared/utils/employee";
import { accountService } from "@/server/modules/account/account.service";
import { auditService } from "@/server/modules/audit/audit.service";
import { employeeService, EmployeeFilters } from "./employee.service";
import { employeeHistoryService } from "./employee-history.service";
import { EmployeeHistory } from "@/shared/types/history.types";

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
    const rawData = await employeeService.getAllEmployees(filters);

    const data: Employee[] = rawData.map((emp) => {
      const probationDaysLeft = emp.status === "PROBATION" && emp.joinDate ? getProbationDaysLeft(emp.joinDate) : null;

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

export async function getEmployeeByIdAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    const emp = await employeeService.getEmployeeDetail(id);
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
      account: user ? accountService.toInfo(user, emp.status) : null,
    });
  } catch (error) {
    return ApiResponse.fromError(error, "Karyawan tidak ditemukan");
  }
}

export async function getEmployeeHistoryAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    return ApiResponse.success("Riwayat karyawan", await employeeHistoryService.forEmployee(id));
  } catch (error) {
    return ApiResponse.fromError<EmployeeHistory>(error, "Gagal mengambil riwayat karyawan");
  }
}

export async function createEmployeeAction(data: EmployeeFormData) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    const { employee, temporaryPassword } = await auditService.track(
      current,
      { action: "EMPLOYEE_CREATED", entity: "EMPLOYEE", targetName: data.name },
      () => employeeService.registerEmployee(data),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success(
      "Karyawan berhasil ditambahkan",
      { id: employee.id, temporaryPassword }
    );
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal membuat karyawan");
  }
}

export async function updateEmployeeAction(id: string, data: EmployeeFormData) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "EMPLOYEE_UPDATED", entity: "EMPLOYEE", entityId: id }, () =>
      employeeService.updateEmployee(id, data),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Data karyawan berhasil diperbarui");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui data karyawan");
  }
}

export async function promoteEmployeeAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "EMPLOYEE_PROMOTED", entity: "EMPLOYEE", entityId: id }, () =>
      employeeService.updateEmployee(id, { status: "ACTIVE" }),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Karyawan berhasil dipromosikan menjadi aktif");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mempromosikan karyawan");
  }
}

export async function deleteEmployeeAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "EMPLOYEE_DELETED", entity: "EMPLOYEE", entityId: id }, () =>
      employeeService.removeEmployee(id, current.userId),
    );
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Karyawan berhasil dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus karyawan");
  }
}
