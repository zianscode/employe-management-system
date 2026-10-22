"use client";

import React from "react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfileInfo } from "./ProfileInfo";
import { SecuritySettings } from "./SecuritySettings";
import { ProfileTabId } from "@/shared/types/profile.types";
import { PageHeader } from "@/shared/components/ui/Page";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Spinner } from "@/shared/components/ui/Feedback";

const TABS: { id: ProfileTabId; label: string }[] = [
  { id: "profil", label: "Profil" },
  { id: "password", label: "Password" },
];

export function ProfileClient() {
  const {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    loading,
    isSaving,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleUpdateProfile,
    handleUpdatePassword,
  } = useProfile();

  return (
    <>
      <PageHeader title="Profil saya" description="Data pribadi dan keamanan akun" />
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {activeTab === "profil" && (
            <ProfileInfo data={profileData} setData={setProfileData} onSave={handleUpdateProfile} isSaving={isSaving} />
          )}
          {activeTab === "password" && (
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
              isSaving={isSaving}
            />
          )}
        </>
      )}
    </>
  );
}
