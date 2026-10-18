"use server";

import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SystemUser } from "@/shared/types/settings.types";

const INACTIVE = ["RESIGNED", "TERMINATED"];

export async function getUsersAction() {
  try {
    await requireRole(ADMIN_ROLES);
    const users = await prisma.user.findMany({
      include: { role: true, employee: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers: SystemUser[] = users.map((user) => ({
      id: user.id,
      name: user.employee?.name || "System Admin",
      email: user.email,
      role: user.role.name,
      status: user.employee && INACTIVE.includes(user.employee.status) ? "Inactive" : "Active",
      lastLogin: user.updatedAt.toLocaleString("id-ID"),
    }));

    return ApiResponse.success("Users fetched successfully", formattedUsers);
  } catch (error) {
    return ApiResponse.fromError<SystemUser[]>(error, "Gagal mengambil data pengguna");
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    if (current.userId === userId) return ApiResponse.error("Anda tidak dapat menghapus akun Anda sendiri");

    await prisma.$transaction([
      prisma.employee.updateMany({ where: { userId }, data: { userId: null } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    return ApiResponse.success("User berhasil dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus user");
  }
}
