"use client";

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
} from "lucide-react";
import { MenuItem } from "./MenuItem";
import { canAccessRoute, isAdminRole, ROLES } from "@/shared/constants/roles";

interface MenuProps {
  currentPath: string;
  role?: string;
  badges?: Record<string, number>;
}

export default function Menu({ currentPath, role = ROLES.EMPLOYEE, badges = {} }: MenuProps) {
  const isAdmin = isAdminRole(role);
  const isActive = (href: string) => (href === "/dashboard" ? currentPath === href : currentPath.startsWith(href));

  const mainItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Karyawan", icon: Users },
    { href: "/dashboard/organization", label: "Organisasi", icon: Building2 },
    { href: "/dashboard/attendance", label: "Absensi", icon: Clock },
    { href: "/dashboard/leave", label: "Cuti", icon: CalendarDays },
    { href: "/dashboard/salary", label: isAdmin ? "Penggajian" : "Gaji", icon: Wallet },
    { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
  ].filter((item) => canAccessRoute(item.href, role));

  const accountItems = [
    { href: "/dashboard/profile", label: "Profil", icon: UserCircle },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  ];

  const sections = [
    { title: "Menu", items: mainItems },
    { title: "Akun", items: accountItems },
  ];

  return (
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-1 px-3 text-xs font-medium text-gray-400">{section.title}</p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <MenuItem key={item.href} {...item} isActive={isActive(item.href)} badge={badges[item.href]} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
