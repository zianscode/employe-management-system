"use client";

import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const hideSidebarPages = ["/login", "/register", "/forgot-password"];
  
  const shouldHideSidebar = hideSidebarPages.includes(pathname);

  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}