"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useSession, signOut } from "next-auth/react";

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  React.useEffect(() => {
    if (status === "unauthenticated") {
      const isProtectedRoute = pathname.startsWith("/dashboard") || pathname === "/onboarding";
      if (isProtectedRoute) {
        signOut({ callbackUrl: "/login", redirect: true });
        return;
      }
    }

    if (status === "authenticated" && session?.user) {
      const isProfileComplete = session.user.isProfileComplete;
      const isOnDashboard = pathname.startsWith("/dashboard");
      const isOnOnboarding = pathname === "/onboarding";

      if (!isProfileComplete && isOnDashboard && !isOnOnboarding) {
        router.replace("/onboarding");
      }
    }
  }, [session, status, pathname, router]);

  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth") || pathname === "/onboarding";
  
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
