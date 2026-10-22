import { prisma } from "@/server/db/prisma";
import { LOGIN_LOCK_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/shared/constants/security";

interface LockableUser {
  id: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

export function isLocked(user: LockableUser): boolean {
  return !!user.lockedUntil && user.lockedUntil > new Date();
}

export async function registerFailedAttempt(user: LockableUser) {
  const attempts = user.failedLoginAttempts + 1;
  const shouldLock = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000) : user.lockedUntil,
    },
  });
}

export async function clearFailedAttempts(user: LockableUser) {
  if (user.failedLoginAttempts === 0 && !user.lockedUntil) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

