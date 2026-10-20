"use client";

import React, { useState } from "react";
import { Settings, Building2, Users, Shield, Bell, LogOut, CalendarOff } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { isAdminRole } from "@/shared/constants/roles";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { GeneralSettings } from "./GeneralSettings";
import { CompanySettings } from "./CompanySettings";
import { HolidaySettings } from "./HolidaySettings";
import { UserManagement } from "./UserManagement";
import { SystemSecurity } from "./SystemSecurity";
import { NotificationSettings } from "./NotificationSettings";
import { SettingsTabId } from "@/shared/types/settings.types";
import SettingsHeader from "./SettingsHeader";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

export function SettingsClient() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const { activeTab, setActiveTab, settings, users, handleToggle, refreshUsers } = useSettings(isAdmin);
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const allTabs: { id: SettingsTabId; label: string; icon: React.ElementType; adminOnly: boolean }[] = [
    { id: "general", label: "Umum", icon: Settings, adminOnly: true },
    { id: "company", label: "Perusahaan", icon: Building2, adminOnly: true },
    { id: "holidays", label: "Hari Libur", icon: CalendarOff, adminOnly: true },
    { id: "users", label: "Pengguna", icon: Users, adminOnly: true },
    { id: "security", label: "Keamanan", icon: Shield, adminOnly: true },
    { id: "notifications", label: "Notifikasi", icon: Bell, adminOnly: true },
    { id: "session", label: "Sesi", icon: LogOut, adminOnly: false },
  ];
  const tabs = allTabs.filter((tab) => isAdmin || !tab.adminOnly);
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : "session";

  return (
    <div className="space-y-4">
      <SettingsHeader />
      <div className="flex overflow-x-auto gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[#E02F75] shadow-lg border border-gray-100"
                  : "text-gray-500 hover:text-[#E02F75] hover:bg-white"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="transition-all duration-500">
        {currentTab === "general" && (
          <GeneralSettings settings={settings} onToggle={handleToggle} />
        )}
        {currentTab === "company" && <CompanySettings />}
        {currentTab === "holidays" && <HolidaySettings />}
        {currentTab === "users" && (
          <UserManagement users={users} onRefresh={refreshUsers} />
        )}
        {currentTab === "security" && (
          <SystemSecurity settings={settings} onToggle={handleToggle} />
        )}
        {currentTab === "notifications" && (
          <NotificationSettings settings={settings} onToggle={handleToggle} />
        )}
        {currentTab === "session" && (
          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-100 rounded-2xl text-red-600">
                <LogOut size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-900 tracking-tight">Sesi Akun</h3>
                <p className="text-red-600 font-medium">Keluar dari aplikasi dan hapus sesi aktif Anda pada perangkat ini.</p>
              </div>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 font-black text-sm uppercase tracking-[0.2em] active:scale-[0.95]"
            >
              Keluar Sekarang
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses dashboard."
        confirmLabel="Ya, Keluar"
        variant="warning"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
