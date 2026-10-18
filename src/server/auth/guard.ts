import { auth } from "./auth";
import { RoleName } from "@/shared/constants/roles";

export class AuthorizationError extends Error {}

export interface CurrentUser {
  userId: string;
  role: RoleName;
  employeeId: string | null;
}

/** User yang sedang login. Melempar AuthorizationError jika belum login. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user?.id) throw new AuthorizationError("Sesi berakhir, silakan login kembali");
  return {
    userId: session.user.id,
    role: (session.user.role || "EMPLOYEE") as RoleName,
    employeeId: session.user.employeeId || null,
  };
}

/** User yang sedang login dan memiliki salah satu role yang diizinkan. */
export async function requireRole(roles: RoleName[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthorizationError("Anda tidak memiliki akses untuk tindakan ini");
  return user;
}

/** User yang sedang login dan memiliki profil karyawan. */
export async function requireEmployee(): Promise<CurrentUser & { employeeId: string }> {
  const user = await requireUser();
  if (!user.employeeId) throw new AuthorizationError("Profil karyawan tidak ditemukan");
  return user as CurrentUser & { employeeId: string };
}
