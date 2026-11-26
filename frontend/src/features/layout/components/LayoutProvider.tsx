"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/api/session";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { ROLES } from "@/shared/constants/roles";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "./CommandPalette";

const STANDALONE_PATHS = ["/login", "/auth", "/onboarding", "/change-password"];

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const { mustChangePassword, isProfileComplete } = session.user;

    if (mustChangePassword && !pathname.startsWith("/change-password")) {
      router.replace("/change-password");
    } else if (!mustChangePassword && !isProfileComplete && pathname.startsWith("/dashboard")) {
      router.replace("/onboarding");
    }
  }, [session, status, pathname, router]);

  if (STANDALONE_PATHS.some((path) => pathname.startsWith(path))) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="contents print:hidden">
        <AppSidebar />
      </div>
      <SidebarInset className="min-w-0 print:m-0">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </SidebarInset>
      <CommandPalette role={session?.user?.role || ROLES.EMPLOYEE} />
    </SidebarProvider>
  );
}
