"use client";

import {
  RxDashboard,
  RxClipboard,
  RxPerson,
  RxGroup,
  RxFileText,
  RxRocket,
  RxGear,
  RxLayers,
} from "react-icons/rx";
import { MenuItem } from "./MenuItem";
import { canAccessRoute, isAdminRole, ROLES } from "@/shared/constants/roles";

interface MenuProps {
  currentPath: string;
  isCollapsed?: boolean;
  role?: string;
}

export default function Menu({ currentPath, isCollapsed, role = ROLES.EMPLOYEE }: MenuProps) {
  const isAdmin = isAdminRole(role);

  const allItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <RxDashboard />,
      isActive: currentPath === "/dashboard" || currentPath === "/",
    },
    {
      href: "/dashboard/employees",
      label: "Employees",
      icon: <RxGroup />,
      isActive: currentPath.startsWith("/dashboard/employees"),
    },
    {
      href: "/dashboard/organization",
      label: "Organization",
      icon: <RxLayers />,
      isActive: currentPath.startsWith("/dashboard/organization"),
    },
    {
      href: "/dashboard/attendance",
      label: "Attendance",
      icon: <RxClipboard />,
      isActive: currentPath === "/dashboard/attendance",
    },
    {
      href: "/dashboard/leave",
      label: "Leave",
      icon: <RxPerson />,
      isActive: currentPath.startsWith("/dashboard/leave"),
    },
    {
      href: "/dashboard/salary",
      label: isAdmin ? "Payroll" : "Salary",
      icon: <RxRocket />,
      isActive: currentPath.startsWith("/dashboard/salary"),
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <RxFileText />,
      isActive: currentPath.startsWith("/dashboard/reports"),
    },
  ];

  const filteredNavigation = allItems.filter(item => canAccessRoute(item.href, role));

  const otherItems = [
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <RxPerson />,
      isActive: currentPath.startsWith("/dashboard/profile"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <RxGear />,
      isActive: currentPath.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <nav className={`space-y-6 ${isCollapsed ? "px-0" : "px-2"}`}>
      <div>
        {!isCollapsed && (
          <h3 className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Main Menu
          </h3>
        )}
        <div className="space-y-1">
          {filteredNavigation.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      <div>
        {!isCollapsed && (
          <h3 className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            System
          </h3>
        )}
        <div className="space-y-1">
          {otherItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
