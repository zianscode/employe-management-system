"use client";

import React, { useState } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { registerAction } from "@/server/modules/auth/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Kata sandi dan konfirmasi tidak cocok!");
      setIsLoading(false);
      return;
    }

    const res = await registerAction({ name, email, password });

    if (res.success) {
      toast.success(res.message);
      router.push("/login");
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white selection:bg-[#E02F75]/10">
      {/* Precision Wave Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-white"></div>
        <svg
          className="absolute inset-y-0 left-[-5%] h-full w-[75%] lg:w-[80%] z-10"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient
              id="vibrant-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FF5A57" />
              <stop offset="50%" stopColor="#E02F75" />
              <stop offset="100%" stopColor="#6700A3" />
            </linearGradient>
            <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
          <path
            d="M-10 -10 L 75 -10 C 90 35, 60 65, 75 110 L -10 110 Z"
            fill="url(#vibrant-grad)"
            filter="url(#soft-blur)"
          />
        </svg>
      </div>

      <div className="relative z-20 flex flex-col lg:flex-row min-h-screen w-full max-w-[1900px] mx-auto">
        {/* Left Side: Branding Content */}
        <div className="hidden lg:flex lg:w-[60%] flex-col justify-between p-24 xl:p-32">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">
              EMS<span className="text-white/50">.</span>PRO
            </span>
          </div>

          <div className="max-w-xl text-white">
            <h1 className="text-6xl font-black leading-[1.05] mb-8 tracking-tighter">
              Bergabunglah dengan{" "}
              <span className="text-white/90 drop-shadow-sm">Masa Depan</span>{" "}
              Manajemen.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10 font-medium">
              Daftarkan diri Anda hari ini dan mulai kelola performa serta
              kesejahteraan Anda dengan sistem yang cerdas.
            </p>
          </div>

          <div className="flex items-center gap-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

        {/* Right Side: Register Panel */}
        <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-10 sm:p-16 lg:p-24 relative">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
              EMS<span className="text-[#E02F75]">.</span>PRO
            </span>
          </div>

          <div className="w-full max-w-[400px]">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter">
                Daftar<span className="text-[#E02F75]">.</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Buat akun karyawan Anda hanya dalam beberapa detik.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100">
              <RegisterForm isLoading={isLoading} onSubmit={handleRegister} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
