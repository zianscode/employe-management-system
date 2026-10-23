"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu as MenuIcon, X } from "lucide-react";
import Menu from "./Menu";
import { APPROVER_ROLES, ROLES, RoleName } from "@/shared/constants/roles";
import { usePendingApprovals } from "@/features/layout/hooks/use-pending-approvals";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/shared/utils/cn";

export const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = session?.user;
  const canApprove = APPROVER_ROLES.includes(user?.role as RoleName);
  const approvals = usePendingApprovals(pathname, canApprove);
  const badges = {
    "/dashboard/leave": approvals.leave,
    "/dashboard/attendance": approvals.attendanceCorrection,
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrandLogo size={28} />
          <span className="text-sm font-semibold text-gray-900">EMS</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Buka menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      {isMobileOpen && <div className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <BrandLogo size={28} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">EMS</p>
              <p className="text-xs text-gray-500">Employee Management</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Tutup menu"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Menu currentPath={pathname} role={user?.role || ROLES.EMPLOYEE} badges={badges} />
        </div>

        <div className="flex items-center gap-3 border-t border-gray-200 p-3">
          <Link href="/dashboard/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 hover:bg-gray-50">
            <Avatar name={user?.name} src={user?.image} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{user?.name || "Memuat..."}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Keluar"
            title="Keluar"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
