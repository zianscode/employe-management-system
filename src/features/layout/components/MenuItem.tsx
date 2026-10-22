import React from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

interface MenuItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}

export const MenuItem = ({ href, label, icon: Icon, isActive }: MenuItemProps) => {
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
      {label}
    </Link>
  );
};
