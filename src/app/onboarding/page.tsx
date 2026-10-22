"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm";
import { BrandLogo } from "@/shared/components/BrandLogo";

export default function OnboardingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold text-gray-900">Employee Management System</span>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-gray-500 hover:text-gray-900">
            Keluar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-gray-900">Lengkapi data diri{session?.user?.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-gray-500">Data ini dipakai HR untuk administrasi, gaji, dan BPJS. Anda bisa mengubahnya nanti di menu Profil.</p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
