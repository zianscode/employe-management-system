export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HR: "HR",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: RoleName[] = [ROLES.SUPER_ADMIN, ROLES.HR];

export const APPROVER_ROLES: RoleName[] = [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER];

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  SUPER_ADMIN: "Kendali penuh seluruh fitur sistem dan pengaturan.",
  HR: "Mengelola data karyawan, penggajian, dan persetujuan akhir.",
  MANAGER: "Melihat tim dan menyetujui permohonan absensi/cuti.",
  EMPLOYEE: "Akses dasar untuk dashboard pribadi dan pengajuan mandiri.",
};

export const isAdminRole = (role?: string | null) =>
  role === ROLES.SUPER_ADMIN || role === ROLES.HR;

const ROUTE_ROLES: Record<string, RoleName[]> = {
  "/dashboard/employees": ADMIN_ROLES,
  "/dashboard/reports": APPROVER_ROLES,
};

export function canAccessRoute(pathname: string, role?: string | null) {
  const entry = Object.entries(ROUTE_ROLES).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/")
  );
  if (!entry) return true;
  return !!role && entry[1].includes(role as RoleName);
}
