"use client";

import React from "react";
import { Settings, Building2, Users, Shield, Bell } from "lucide-react";
import { useSettings } from "@/features/settings/presentation/hooks/useSettings";
import SettingsHeader from "@/features/settings/presentation/components/SettingsHeader";
import { GeneralSettings } from "@/features/settings/presentation/components/GeneralSettings";
import { CompanySettings } from "@/features/settings/presentation/components/CompanySettings";
import { UserManagement } from "@/features/settings/presentation/components/UserManagement";
import { SystemSecurity } from "@/features/settings/presentation/components/SystemSecurity";
import { NotificationSettings } from "@/features/settings/presentation/components/NotificationSettings";

import { SettingsTabId } from "@/features/settings/domain/entities/settings";

export default function SettingsPage() {
  const { activeTab, setActiveTab, settings, handleToggle } = useSettings();

  const tabs: { id: SettingsTabId; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "Umum", icon: Settings },
    { id: "company", label: "Perusahaan", icon: Building2 },
    { id: "users", label: "Pengguna", icon: Users },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "notifications", label: "Notifikasi", icon: Bell },
  ];

  return (
    <div className="py-4 pl-8 pr-6">
      <SettingsHeader />

      <div className="space-y-4 mt-4">
        <div className="flex overflow-x-auto gap-2 bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
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
          {activeTab === "general" && (
            <GeneralSettings settings={settings} onToggle={handleToggle} />
          )}
          {activeTab === "company" && <CompanySettings />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "security" && (
            <SystemSecurity settings={settings} onToggle={handleToggle} />
          )}
          {activeTab === "notifications" && (
            <NotificationSettings settings={settings} onToggle={handleToggle} />
          )}
        </div>
      </div>
    </div>
  );
}
