"use client";

import React from "react";
import { User, Shield, Settings, Activity } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfileInfo } from "./ProfileInfo";
import { SecuritySettings } from "./SecuritySettings";
import { AppPreferences } from "./AppPreferences";
import { ActivityLog } from "./ActivityLog";
import { ProfileTabId } from "@/shared/types/profile.types";

export function ProfileClient() {
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
    handleUpdateProfile,
    handleUpdatePassword,
    handleUpdatePreferences,
  } = useProfile();

  const tabs: { id: ProfileTabId; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "keamanan", label: "Keamanan", icon: Shield },
    { id: "preferensi", label: "Preferensi", icon: Settings },
    { id: "aktivitas", label: "Aktivitas", icon: Activity },
  ];

  return (
    <div className="space-y-4">
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
          <ProfileInfo data={profileData} setData={setProfileData} onSave={handleUpdateProfile} />
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
            onUpdate={handleUpdatePassword}
          />
        )}
        {activeTab === "preferensi" && (
          <AppPreferences data={preferences} setData={setPreferences} onSave={handleUpdatePreferences} />
        )}
        {activeTab === "aktivitas" && <ActivityLog logs={activityLogs} />}
      </div>
    </div>
  );
}
