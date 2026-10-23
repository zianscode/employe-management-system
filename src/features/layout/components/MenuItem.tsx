import React from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

interface MenuItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
}

export const MenuItem = ({ href, label, icon: Icon, isActive, badge }: MenuItemProps) => {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
        isActive ? "bg-brand-50 text-brand" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-brand" : "text-gray-400")} />
      <span className="flex-1">{label}</span>
      {!!badge && (
        <span
          className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-medium leading-5 text-white"
          aria-label={`${badge} menunggu persetujuan`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
};
