"use client";

import React from "react";
import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm";
import { useSession } from "next-auth/react";
import { ShieldAlert, Award, User } from "lucide-react";

export default function OnboardingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] selection:bg-brand/10 overflow-x-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[80%] bg-brand/15 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[80%] bg-brand-dark/15 rounded-full blur-[120px] animate-pulse duration-[8s]"></div>
        <div className="absolute top-[20%] right-[5%] w-[40%] h-[50%] bg-blue-400/10 rounded-full blur-[100px]"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40"></div>
      </div>

      <div className="relative z-10 pt-12 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Profile Activation Experience
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-tight animate-in fade-in slide-in-from-top-6 duration-700">
            Selamat Datang, <span className="text-brand">{session?.user?.name || "Pengguna"}</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-top-10 duration-1000">
            Langkah terakhir sebelum memulai. Mari lengkapi profil Anda untuk membuka akses penuh ke ekosistem Employee Management System.
          </p>
        </div>

        <OnboardingForm />

        <div className="text-center mt-12 space-y-4 animate-in fade-in duration-1000">
          <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
            Enterprise-Grade Security Protocol Active
          </div>
          <div className="flex justify-center gap-6 opacity-20 grayscale transition-all hover:grayscale-0 hover:opacity-40 duration-500">
            <ShieldAlert size={18} className="text-slate-900" />
            <Award size={18} className="text-slate-900" />
            <User size={18} className="text-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
