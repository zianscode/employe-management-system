import { prisma } from "@/server/db/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

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
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : user.lockedUntil,
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

export const LOGIN_LOCK_MINUTES = LOCK_MINUTES;
