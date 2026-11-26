"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/api/session";
import { Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import { Kbd } from "@/shared/components/ui/kbd";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { ROLES } from "@/shared/constants/roles";
import { getBreadcrumbs } from "@/features/layout/navigation";
import { openCommandPalette } from "./CommandPalette";

export function AppHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const crumbs = getBreadcrumbs(pathname, session?.user?.role || ROLES.EMPLOYEE);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 print:hidden sm:px-6">
      <SidebarTrigger className="-ml-1" aria-label="Buka atau tutup menu" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" onClick={openCommandPalette} className="hidden text-muted-foreground sm:inline-flex">
        <Search />
        Cari
        <Kbd>Ctrl K</Kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={openCommandPalette} className="sm:hidden" aria-label="Cari">
        <Search />
      </Button>
    </header>
  );
}
