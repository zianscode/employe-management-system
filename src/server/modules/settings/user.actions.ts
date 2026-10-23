"use server";

import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { accountService } from "@/server/modules/account/account.service";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SystemUser } from "@/shared/types/settings.types";

export async function getUsersAction() {
  try {
    const current = await requireRole(ADMIN_ROLES);
    const users = await prisma.user.findMany({
      include: { role: true, employee: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers: SystemUser[] = users.map((user) => ({
      ...accountService.toInfo(user, user.employee?.status),
      name: user.employee?.name || "System Admin",
      email: user.email,
      role: user.role.name,
      employeeId: user.employee?.id ?? null,
      isSelf: user.id === current.userId,
    }));

    return ApiResponse.success("Users fetched successfully", formattedUsers);
  } catch (error) {
    return ApiResponse.fromError<SystemUser[]>(error, "Gagal mengambil data pengguna");
  }
}
