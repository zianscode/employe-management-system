import { auth } from "./auth";
import { ROLES, RoleName } from "@/shared/constants/roles";

export class AuthorizationError extends Error {}

export interface CurrentUser {
  userId: string;
  role: RoleName;
  employeeId: string | null;
}

export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user?.id) throw new AuthorizationError("Sesi berakhir, silakan login kembali");
  return {
    userId: session.user.id,
    role: (session.user.role || ROLES.EMPLOYEE) as RoleName,
    employeeId: session.user.employeeId || null,
  };
}

export async function requireRole(roles: RoleName[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthorizationError("Anda tidak memiliki akses untuk tindakan ini");
  return user;
}

export async function requireEmployee(): Promise<CurrentUser & { employeeId: string }> {
  const user = await requireUser();
  if (!user.employeeId) throw new AuthorizationError("Profil karyawan tidak ditemukan");
  return user as CurrentUser & { employeeId: string };
}
