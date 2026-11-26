"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api/session";
import { useTheme } from "next-themes";
import { CalendarPlus, Calculator, LogOut, Moon, Sun, UserPlus } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { getNavigation } from "@/features/layout/navigation";
import { getEmployees } from "@/lib/api/client";
import { isAdminRole } from "@/shared/constants/roles";
import { Employee } from "@/shared/types/employee.types";
import { UserAvatar } from "@/shared/components/UserAvatar";

const OPEN_EVENT = "command-palette:open";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandPalette({ role }: { role: string }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const isAdmin = isAdminRole(role);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open || !isAdmin || employees) return;
    getEmployees().then((res) => setEmployees(res.success && res.data ? res.data : []));
  }, [open, isAdmin, employees]);

  const run = useCallback((task: () => void) => {
    setOpen(false);
    task();
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Cari"
      description="Cari halaman, aksi cepat, atau karyawan"
    >
      <CommandInput placeholder="Cari halaman, aksi, atau karyawan..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil.</CommandEmpty>

        {getNavigation(role).map((section) => (
          <CommandGroup key={section.title} heading={section.title === "Menu" ? "Halaman" : section.title}>
            {section.items.map(({ href, label, icon: Icon }) => (
              <CommandItem key={href} value={`halaman ${label}`} onSelect={() => run(() => router.push(href))}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Aksi cepat">
          <CommandItem value="ajukan cuti" onSelect={() => run(() => router.push("/dashboard/leave"))}>
            <CalendarPlus />
            Ajukan cuti
          </CommandItem>
          {isAdmin && (
            <>
              <CommandItem value="tambah karyawan baru" onSelect={() => run(() => router.push("/dashboard/employees/new"))}>
                <UserPlus />
                Tambah karyawan
              </CommandItem>
              <CommandItem value="hitung gaji payroll" onSelect={() => run(() => router.push("/dashboard/salary"))}>
                <Calculator />
                Hitung gaji
              </CommandItem>
            </>
          )}
          <CommandItem value={`ganti tema ${isDark ? "terang" : "gelap"}`} onSelect={() => run(() => setTheme(isDark ? "light" : "dark"))}>
            {isDark ? <Sun /> : <Moon />}
            Ganti ke tema {isDark ? "terang" : "gelap"}
          </CommandItem>
          <CommandItem value="keluar logout" onSelect={() => run(() => signOut({ callbackUrl: "/login" }))}>
            <LogOut />
            Keluar
          </CommandItem>
        </CommandGroup>

        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Karyawan">
              {employees === null && <p className="px-2 py-1.5 text-sm text-muted-foreground">Memuat karyawan...</p>}
              {employees?.map((employee) => (
                <CommandItem
                  key={employee.id}
                  value={`karyawan ${employee.name} ${employee.nip} ${employee.email}`}
                  onSelect={() => run(() => router.push(`/dashboard/employees/${employee.id}`))}
                >
                  <UserAvatar name={employee.name} src={employee.avatar || null} size="sm" className="size-6 text-[10px]" />
                  <span className="min-w-0 flex-1 truncate">{employee.name}</span>
                  <span className="text-xs text-muted-foreground">{employee.position}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
