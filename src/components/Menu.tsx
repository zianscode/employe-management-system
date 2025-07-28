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
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

export default function Menu({ currentPath }: MenuProps) {
  const navigationItems = [
    {
      href: "/dashboard",
      label: "dashboard",
      icon: <RxDashboard size={20} />,
      isActive: currentPath === "/dashboard" || currentPath === "/",
    },
    {
      href: "/dashboard/attendance",
      label: "attendance",
      icon: <RxClipboard size={20} />,
      isActive: currentPath === "/dashboard/attendance",
    },
    {
      href: "/dashboard/employees",
      label: "employees",
      icon: <RxGroup size={20} />,
      isActive: currentPath.startsWith("/dashboard/employees"),
    },
    {
      href: "/dashboard/leave",
      label: "leave",
      icon: <RxPerson size={20} />,
      isActive: currentPath.startsWith("/dashboard/leave"),
    },
    {
      href: "/dashboard/reports",
      label: "reports",
      icon: <RxFileText size={20} />,
      isActive: currentPath.startsWith("/dashboard/reports"),
    },
    {
      href: "/dashboard/salary",
      label: "salary",
      icon: <RxRocket size={20} />,
      isActive: currentPath.startsWith("/dashboard/salary"),
    },
  ];

  const otherItems = [
    {
      href: "/dashboard/profile",
      label: "profile",
      icon: <RxPerson size={20} />,
      isActive: currentPath.startsWith("/dashboard/profile"),
    },
    {
      href: "/dashboard/settings",
      label: "settings",
      icon: <RxGear size={20} />,
      isActive: currentPath.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <nav className="space-y-6 px-2">
      <div>
        <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </h3>
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Other
        </h3>
        <div className="space-y-1">
          {otherItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
