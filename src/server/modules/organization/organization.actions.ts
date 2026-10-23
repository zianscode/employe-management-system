"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { auditService } from "@/server/modules/audit/audit.service";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { OrgOption } from "@/shared/types/employee.types";
import { DepartmentRow, PositionRow } from "@/shared/types/organization.types";
import { DepartmentInput, organizationService, PositionInput } from "./organization.service";

const ORGANIZATION_PATH = "/dashboard/organization";

export async function getOrgDataAction() {
  try {
    await requireRole(ADMIN_ROLES);
    return await organizationService.listFormOptions();
  } catch (error) {
    console.error("Failed to fetch organization data:", error);
    return { departments: [] as OrgOption[], positions: [] as OrgOption[], managers: [] as OrgOption[] };
  }
}

export async function getOrganizationAction() {
  try {
    await requireRole(ADMIN_ROLES);
    const [departments, positions] = await Promise.all([
      organizationService.listDepartments(),
      organizationService.listPositions(),
    ]);
    return ApiResponse.success("Data organisasi", { departments, positions });
  } catch (error) {
    return ApiResponse.fromError<{ departments: DepartmentRow[]; positions: PositionRow[] }>(error, "Gagal mengambil data organisasi");
  }
}

export async function saveDepartmentAction(input: DepartmentInput, id?: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "DEPARTMENT_SAVED", entity: "DEPARTMENT", entityId: id, targetName: input.name }, () =>
      organizationService.saveDepartment(input, id),
    );
    revalidatePath(ORGANIZATION_PATH);
    return ApiResponse.success(id ? "Divisi diperbarui" : "Divisi ditambahkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menyimpan divisi");
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "DEPARTMENT_DELETED", entity: "DEPARTMENT", entityId: id }, () =>
      organizationService.deleteDepartment(id),
    );
    revalidatePath(ORGANIZATION_PATH);
    return ApiResponse.success("Divisi dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus divisi");
  }
}

export async function savePositionAction(input: PositionInput, id?: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(
      current,
      {
        action: "POSITION_SAVED",
        entity: "POSITION",
        entityId: id,
        targetName: input.name,
        detail: `Gaji standar Rp${input.salaryBase.toLocaleString("id-ID")}`,
      },
      () => organizationService.savePosition(input, id),
    );
    revalidatePath(ORGANIZATION_PATH);
    return ApiResponse.success(id ? "Jabatan diperbarui" : "Jabatan ditambahkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menyimpan jabatan");
  }
}

export async function deletePositionAction(id: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "POSITION_DELETED", entity: "POSITION", entityId: id }, () =>
      organizationService.deletePosition(id),
    );
    revalidatePath(ORGANIZATION_PATH);
    return ApiResponse.success("Jabatan dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus jabatan");
  }
}
