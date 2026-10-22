"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useSession } from "next-auth/react";

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const isProfileComplete = session.user.isProfileComplete;
      const isOnDashboard = pathname.startsWith("/dashboard");
      const isOnOnboarding = pathname === "/onboarding";

      if (session.user.mustChangePassword && !pathname.startsWith("/change-password")) {
        router.replace("/change-password");
      } else if (!session.user.mustChangePassword && !isProfileComplete && isOnDashboard && !isOnOnboarding) {
        router.replace("/onboarding");
      }
    }
  }, [session, status, pathname, router]);

  const isAuthPage = ["/login", "/auth", "/onboarding", "/change-password"].some((path) => pathname.startsWith(path));
  
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <main className="lg:pl-60 print:pl-0">{children}</main>
    </div>
  );
}
