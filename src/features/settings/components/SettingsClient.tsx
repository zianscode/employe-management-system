"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { isAdminRole } from "@/shared/constants/roles";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { CompanySettings } from "./CompanySettings";
import { HolidaySettings } from "./HolidaySettings";
import { UserManagement } from "./UserManagement";
import { SystemSecurity } from "./SystemSecurity";
import { SettingsTabId } from "@/shared/types/settings.types";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { PageHeader } from "@/shared/components/ui/Page";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";

const ALL_TABS: { id: SettingsTabId; label: string; adminOnly: boolean }[] = [
  { id: "company", label: "Perusahaan", adminOnly: true },
  { id: "holidays", label: "Hari libur", adminOnly: true },
  { id: "users", label: "Pengguna", adminOnly: true },
  { id: "security", label: "Keamanan", adminOnly: true },
  { id: "session", label: "Sesi", adminOnly: false },
];

export function SettingsClient() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const { activeTab, setActiveTab, users, refreshUsers } = useSettings(isAdmin);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const tabs = ALL_TABS.filter((tab) => isAdmin || !tab.adminOnly);
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : "session";

  return (
    <>
      <PageHeader title="Pengaturan" description={isAdmin ? "Konfigurasi perusahaan dan sistem" : "Pengaturan akun"} />

      <Tabs tabs={tabs} value={currentTab} onChange={setActiveTab} />

      {currentTab === "company" && <CompanySettings />}
      {currentTab === "holidays" && <HolidaySettings />}
      {currentTab === "users" && <UserManagement users={users} onRefresh={refreshUsers} />}
      {currentTab === "security" && <SystemSecurity />}
      {currentTab === "session" && (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Keluar dari aplikasi</p>
            <p className="mt-1 text-sm text-gray-500">Sesi di perangkat ini akan diakhiri dan Anda perlu login lagi.</p>
          </div>
          <Button variant="secondary" onClick={() => setIsLogoutModalOpen(true)}>
            Keluar
          </Button>
        </Card>
      )}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Keluar dari aplikasi?"
        message="Anda perlu login lagi untuk mengakses dashboard."
        confirmLabel="Keluar"
        variant="warning"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
