"use server";

import { prisma } from "@/server/db/prisma";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SystemUser } from "@/shared/types/settings.types";
import bcrypt from "bcryptjs";

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

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  try {
    await requireRole(ADMIN_ROLES);
    if (newPassword.length < 6) return ApiResponse.error("Password minimal 6 karakter");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return ApiResponse.success("Password user berhasil direset");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mereset password user");
  }
}

/**
 * Menghapus akun login saja. Data karyawan (dan riwayatnya) tetap tersimpan,
 * hanya tidak lagi memiliki akun.
 */
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
