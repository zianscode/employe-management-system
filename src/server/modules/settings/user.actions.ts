"use server";

import { prisma } from "@/server/db/prisma";
import { ApiResponse } from "@/server/utils/api-response";
import bcrypt from "bcryptjs";

export async function getUsersAction() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.employee?.name || "System Admin",
      email: user.email,
      role: user.role.name,
      status: "Active",
      lastLogin: user.updatedAt.toLocaleString(),
    }));

    return ApiResponse.success("Users fetched successfully", formattedUsers);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil data pengguna";
    return ApiResponse.error(errorMessage);
  }
}

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return ApiResponse.success("Password user berhasil direset");
  } catch (error) {
    return ApiResponse.error(error instanceof Error ? error.message : "Gagal mereset password user");
  }
}

export async function deleteUserAction(userId: string) {
  try {
    // Check if user is trying to delete themselves? (Optional safety)
    await prisma.user.delete({ where: { id: userId } });
    return ApiResponse.success("User berhasil dihapus");
  } catch (error) {
    return ApiResponse.error(error instanceof Error ? error.message : "Gagal menghapus user");
  }
}
