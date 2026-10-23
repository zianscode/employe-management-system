import { prisma } from "@/server/db/prisma";
import { CurrentUser } from "@/server/auth/guard";
import { generateTemporaryPassword, hashPassword } from "@/server/utils/password";
import { ROLES } from "@/shared/constants/roles";
import { AccountInfo, AccountState } from "@/shared/types/settings.types";
import { EmployeeStatus } from "@prisma/client";

const INACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED];

interface AccountSource {
  id: string;
  mustChangePassword: boolean;
  lockedUntil: Date | null;
}

class AccountService {
  toInfo(user: AccountSource, employeeStatus?: EmployeeStatus | null): AccountInfo {
    const isLocked = !!user.lockedUntil && user.lockedUntil > new Date();
    let state: AccountState = "ACTIVE";
    if (employeeStatus && INACTIVE_STATUSES.includes(employeeStatus)) state = "INACTIVE";
    else if (isLocked) state = "LOCKED";
    else if (user.mustChangePassword) state = "MUST_CHANGE_PASSWORD";

    return {
      userId: user.id,
      state,
      lockedUntil: isLocked
        ? user.lockedUntil!.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
        : null,
    };
  }

  private async findManageable(targetUserId: string, current: CurrentUser) {
    const target = await prisma.user.findUnique({ where: { id: targetUserId }, include: { role: true } });
    if (!target) throw new Error("Akun tidak ditemukan");
    if (target.id === current.userId) throw new Error("Untuk akun sendiri, gunakan menu Profil");
    if (target.role.name === ROLES.SUPER_ADMIN && current.role !== ROLES.SUPER_ADMIN) {
      throw new Error("Hanya Super Admin yang bisa mengelola akun Super Admin");
    }
    return target;
  }

  async resetPassword(targetUserId: string, current: CurrentUser) {
    const target = await this.findManageable(targetUserId, current);
    const temporaryPassword = generateTemporaryPassword();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: target.id },
        data: {
          password: await hashPassword(temporaryPassword),
          mustChangePassword: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: target.id } }),
    ]);

    return temporaryPassword;
  }

  async unlock(targetUserId: string, current: CurrentUser) {
    const target = await this.findManageable(targetUserId, current);
    await prisma.user.update({ where: { id: target.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }
}

export const accountService = new AccountService();
