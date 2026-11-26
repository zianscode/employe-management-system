"use client";

import React from "react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfileInfo } from "./ProfileInfo";
import { SecuritySettings } from "./SecuritySettings";
import { ProfileTabId } from "@/shared/types/profile.types";
import { PageHeader } from "@/shared/components/PageLayout";
import { TabNav } from "@/shared/components/TabNav";
import { Spinner } from "@/shared/components/ui/spinner";

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
    handleUpdateProfile,
    handleUpdatePassword,
  } = useProfile();

  return (
    <>
      <PageHeader title="Profil saya" description="Data pribadi dan keamanan akun" />
      <TabNav tabs={TABS} value={activeTab} onChange={setActiveTab} />

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
              onUpdate={handleUpdatePassword}
              isSaving={isSaving}
            />
          )}
        </>
      )}
    </>
  );
}
