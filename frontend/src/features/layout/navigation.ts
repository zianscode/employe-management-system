import {
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { canAccessRoute, isAdminRole } from "@/shared/constants/roles";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Crumb {
  label: string;
  href?: string;
}

export function getNavigation(role: string): NavSection[] {
  const isAdmin = isAdminRole(role);

  const mainItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Karyawan", icon: Users },
    { href: "/dashboard/organization", label: "Organisasi", icon: Building2 },
    { href: "/dashboard/attendance", label: "Absensi", icon: Clock },
    { href: "/dashboard/leave", label: "Cuti", icon: CalendarDays },
    { href: "/dashboard/salary", label: isAdmin ? "Penggajian" : "Gaji", icon: Wallet },
    { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
  ].filter((item) => canAccessRoute(item.href, role));

  return [
    { title: "Menu", items: mainItems },
    {
      title: "Akun",
      items: [
        { href: "/dashboard/profile", label: "Profil", icon: UserCircle },
        { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
      ],
    },
  ];
}

export function isNavActive(href: string, currentPath: string) {
  return href === "/dashboard" ? currentPath === href : currentPath.startsWith(href);
}

const SUB_PAGE_LABELS: Record<string, string> = {
  new: "Tambah",
  edit: "Edit",
  slip: "Slip gaji",
};

export function getBreadcrumbs(pathname: string, role: string): Crumb[] {
  const items = getNavigation(role).flatMap((section) => section.items);
  const section = items
    .filter((item) => item.href !== "/dashboard" && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!section) return [{ label: "Dashboard" }];

  const rest = pathname.slice(section.href.length).split("/").filter(Boolean);
  if (rest.length === 0) return [{ label: section.label }];

  const last = rest[rest.length - 1];
  const crumbs: Crumb[] = [{ label: section.label, href: section.href }];
  if (rest.length > 1 && !SUB_PAGE_LABELS[rest[0]]) {
    crumbs.push({ label: "Detail", href: `${section.href}/${rest[0]}` });
  }
  crumbs.push({ label: SUB_PAGE_LABELS[last] ?? "Detail" });
  return crumbs;
}
