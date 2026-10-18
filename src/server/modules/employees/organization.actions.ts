"use server";

import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ADMIN_ROLES, APPROVER_ROLES } from "@/shared/constants/roles";
import { OrgOption } from "@/shared/types/employee.types";

export async function getOrgDataAction() {
  const empty = { departments: [] as OrgOption[], positions: [] as OrgOption[], managers: [] as OrgOption[] };
  try {
    await requireRole(ADMIN_ROLES);
    const [departments, positions, managers] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.position.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.employee.findMany({
        where: {
          status: { in: ["ACTIVE", "PROBATION"] },
          user: { role: { name: { in: APPROVER_ROLES } } },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { departments, positions, managers };
  } catch (error) {
    console.error("Failed to fetch organization data:", error);
    return empty;
  }
}
