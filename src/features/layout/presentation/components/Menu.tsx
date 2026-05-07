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
import { MenuItem } from "@/features/layout/presentation/components/MenuItem";

interface MenuProps {
  currentPath: string;
  isCollapsed?: boolean;
}

export default function Menu({ currentPath, isCollapsed }: MenuProps) {
  const navigationItems = [
    {
      href: "/dashboard",
      label: "dashboard",
      icon: <RxDashboard />,
      isActive: currentPath === "/dashboard" || currentPath === "/",
    },
    {
      href: "/dashboard/attendance",
      label: "attendance",
      icon: <RxClipboard />,
      isActive: currentPath === "/dashboard/attendance",
    },
    {
      href: "/dashboard/employees",
      label: "employees",
      icon: <RxGroup />,
      isActive: currentPath.startsWith("/dashboard/employees"),
    },
    {
      href: "/dashboard/leave",
      label: "leave",
      icon: <RxPerson />,
      isActive: currentPath.startsWith("/dashboard/leave"),
    },
    {
      href: "/dashboard/reports",
      label: "reports",
      icon: <RxFileText />,
      isActive: currentPath.startsWith("/dashboard/reports"),
    },
    {
      href: "/dashboard/salary",
      label: "salary",
      icon: <RxRocket />,
      isActive: currentPath.startsWith("/dashboard/salary"),
    },
  ];

  const otherItems = [
    {
      href: "/dashboard/profile",
      label: "profile",
      icon: <RxPerson />,
      isActive: currentPath.startsWith("/dashboard/profile"),
    },
    {
      href: "/dashboard/settings",
      label: "settings",
      icon: <RxGear />,
      isActive: currentPath.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <nav className={`space-y-6 ${isCollapsed ? "px-0" : "px-2"}`}>
      <div>
        {!isCollapsed && (
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </h3>
        )}
        <div className="space-y-1">
          {navigationItems.map((item) => (
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
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Other
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
