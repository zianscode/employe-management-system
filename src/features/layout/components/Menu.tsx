"use client";

import {
  RxDashboard,
  RxClipboard,
  RxPerson,
  RxGroup,
  RxFileText,
  RxRocket,
  RxGear,
} from "react-icons/rx";
import { MenuItem } from "./MenuItem";

interface MenuProps {
  currentPath: string;
  isCollapsed?: boolean;
  role?: string;
}

export default function Menu({ currentPath, isCollapsed, role = "EMPLOYEE" }: MenuProps) {
  const isAdmin = role === "SUPER_ADMIN" || role === "HR";

  const allItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <RxDashboard />,
      isActive: currentPath === "/dashboard" || currentPath === "/",
      roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      href: "/dashboard/employees",
      label: "Employees",
      icon: <RxGroup />,
      isActive: currentPath.startsWith("/dashboard/employees"),
      roles: ["SUPER_ADMIN", "HR"],
    },
    {
      href: "/dashboard/attendance",
      label: "Attendance",
      icon: <RxClipboard />,
      isActive: currentPath === "/dashboard/attendance",
      roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      href: "/dashboard/leave",
      label: "Leave",
      icon: <RxPerson />,
      isActive: currentPath.startsWith("/dashboard/leave"),
      roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      href: "/dashboard/salary",
      label: isAdmin ? "Payroll" : "Salary",
      icon: <RxRocket />,
      isActive: currentPath.startsWith("/dashboard/salary"),
      roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"],
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <RxFileText />,
      isActive: currentPath.startsWith("/dashboard/reports"),
      roles: ["SUPER_ADMIN", "HR", "MANAGER"],
    },
  ];

  const filteredNavigation = allItems.filter(item => item.roles.includes(role));

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
