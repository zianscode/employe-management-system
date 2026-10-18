export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HR: "HR",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** Role yang mengelola seluruh data perusahaan */
export const ADMIN_ROLES: RoleName[] = [ROLES.SUPER_ADMIN, ROLES.HR];

export const isAdminRole = (role?: string | null) =>
  role === ROLES.SUPER_ADMIN || role === ROLES.HR;

/**
 * Hak akses halaman dashboard. Dipakai oleh middleware (proteksi URL)
 * dan sidebar (menu yang ditampilkan). Path yang tidak tercantum boleh diakses semua role.
 */
export const ROUTE_ROLES: Record<string, RoleName[]> = {
  "/dashboard/employees": [ROLES.SUPER_ADMIN, ROLES.HR],
  "/dashboard/reports": [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER],
};

export function canAccessRoute(pathname: string, role?: string | null) {
  const entry = Object.entries(ROUTE_ROLES).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/")
  );
  if (!entry) return true;
  return !!role && entry[1].includes(role as RoleName);
}
