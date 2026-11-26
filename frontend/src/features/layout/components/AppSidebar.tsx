"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/api/session";
import { Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Kbd } from "@/shared/components/ui/kbd";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { APPROVER_ROLES, ROLES, RoleName } from "@/shared/constants/roles";
import { getNavigation, isNavActive } from "@/features/layout/navigation";
import { usePendingApprovals } from "@/features/layout/hooks/use-pending-approvals";
import { openCommandPalette } from "./CommandPalette";
import { NavUser } from "./NavUser";

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const user = session?.user;
  const role = user?.role || ROLES.EMPLOYEE;
  const approvals = usePendingApprovals(pathname, APPROVER_ROLES.includes(role as RoleName));
  const badges: Record<string, number> = {
    "/dashboard/leave": approvals.leave,
    "/dashboard/attendance": approvals.attendanceCorrection,
  };

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Employee Management System">
              <Link href="/dashboard">
                <BrandLogo size={32} className="size-8 shrink-0" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">EMS</span>
                  <span className="truncate text-xs text-muted-foreground">Employee Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cari (Ctrl+K)" onClick={openCommandPalette} className="text-muted-foreground">
              <Search />
              <span className="flex-1">Cari...</span>
              <Kbd className="group-data-[collapsible=icon]:hidden">Ctrl K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {getNavigation(role).map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isNavActive(href, pathname)} tooltip={label}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badges[href] > 0 && (
                      <SidebarMenuBadge
                        className="bg-destructive text-white peer-hover/menu-button:text-white"
                        aria-label={`${badges[href]} menunggu persetujuan`}
                      >
                        {badges[href] > 99 ? "99+" : badges[href]}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser name={user?.name} email={user?.email} image={user?.image} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
