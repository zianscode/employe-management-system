import React from "react";
import { ProfileClient } from "@/features/profile/components/ProfileClient";
import { getProfileAction } from "@/server/modules/profile/profile.actions";

export default async function ProfilePage() {
  await getProfileAction();

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Profil Saya</h1>
        <p className="text-white/80 text-sm font-medium">Kelola informasi profil dan pengaturan akun Anda</p>
      </div>

      <div className="space-y-4 mt-4">
        <ProfileClient />
      </div>
    </div>
  );
}