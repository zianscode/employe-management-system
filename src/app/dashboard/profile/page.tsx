"use client";

import React from "react";
import { User, Shield, Settings, Activity } from "lucide-react";
import { useProfile } from "@/features/profile/presentation/hooks/useProfile";
import { ProfileInfo } from "@/features/profile/presentation/components/ProfileInfo";
import { SecuritySettings } from "@/features/profile/presentation/components/SecuritySettings";
import { AppPreferences } from "@/features/profile/presentation/components/AppPreferences";
import { ActivityLog } from "@/features/profile/presentation/components/ActivityLog";

import { ProfileTabId } from "@/features/profile/domain/entities/profile";

export default function ProfilePage() {
  const {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    preferences,
    setPreferences,
    activityLogs,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useProfile();

  const tabs: { id: ProfileTabId; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "keamanan", label: "Keamanan", icon: Shield },
    { id: "preferensi", label: "Preferensi", icon: Settings },
    { id: "aktivitas", label: "Aktivitas", icon: Activity },
  ];

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Profil Saya</h1>
        <p className="text-white/80 text-sm font-medium">Kelola informasi profil dan pengaturan akun Anda</p>
      </div>

      <div className="space-y-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 border-b-2 ${
                    isActive
                      ? "border-[#E02F75] text-[#E02F75] bg-[#E02F75]/5"
                      : "border-transparent text-gray-500 hover:text-[#E02F75] hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="transition-all duration-500 ease-in-out pb-10">
          {activeTab === "profil" && (
            <ProfileInfo data={profileData} setData={setProfileData} onSave={() => console.log("Profile Saved")} />
          )}
          {activeTab === "keamanan" && (
            <SecuritySettings
              data={passwordData}
              setData={setPasswordData}
              showCurrent={showCurrentPassword}
              setShowCurrent={setShowCurrentPassword}
              showNew={showNewPassword}
              setShowNew={setShowNewPassword}
              showConfirm={showConfirmPassword}
              setShowConfirm={setShowConfirmPassword}
              onUpdate={() => console.log("Password Updated")}
            />
          )}
          {activeTab === "preferensi" && (
            <AppPreferences data={preferences} setData={setPreferences} onSave={() => console.log("Preferences Saved")} />
          )}
          {activeTab === "aktivitas" && <ActivityLog logs={activityLogs} />}
        </div>
      </div>
    </div>
  );
}