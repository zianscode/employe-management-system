"use client";

import React from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/use-login";

export default function LoginPage() {
  const {
    formData,
    showPassword,
    isLoading,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white selection:bg-[#E02F75]/10">
      {/* Precision Wave Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* White Base */}
        <div className="absolute inset-0 bg-white"></div>

        {/* Vibrant SVG Wave (Left Side) */}
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
          {/* Extended Path to prevent edge blur bleed */}
          <path 
            d="M-10 -10 L 75 -10 C 90 35, 60 65, 75 110 L -10 110 Z" 
            fill="url(#vibrant-grad)"
            filter="url(#soft-blur)"
          />
        </svg>

        {/* Subtle Floating Glows */}
        <div className="absolute top-[15%] left-[10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-20 flex flex-col lg:flex-row min-h-screen w-full max-w-[1900px] mx-auto">
        {/* Left Side: Branding Content (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-[60%] flex-col justify-between p-24 xl:p-32">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a9.835 9.835 0 01-5.123 8.81L13.13 20"
                />
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">
              EMS<span className="text-white/50">.</span>PRO
            </span>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              Vibrant System Active
            </div>
            <h1 className="text-6xl font-black text-white leading-[1.05] mb-8 tracking-tighter">
              Elevasi{" "}
              <span className="text-white/90 drop-shadow-sm">
                Produktivitas
              </span>{" "}
              Tanpa Batas.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-[90%] font-medium">
              Sistem manajemen karyawan terpadu yang dirancang untuk efisiensi
              operasional dan pertumbuhan strategis bisnis Anda.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[15, 22, 45, 64].map((id) => (
                  <div
                    key={id}
                    className="w-12 h-12 rounded-full border-4 border-white/20 shadow-lg relative overflow-hidden backdrop-blur-sm"
                  >
                    <Image
                      src={`https://i.pravatar.cc/150?u=${id}`}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">
                  Solusi Terpercaya
                </p>
                <p className="text-white/60 text-xs font-medium">
                  Manajemen Karyawan Modern
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-10 sm:p-16 lg:p-24 relative">
          {/* Mobile Header Logo (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A57] to-[#E02F75] flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a9.835 9.835 0 01-5.123 8.81L13.13 20"
                />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
              EMS<span className="text-[#E02F75]">.</span>PRO
            </span>
          </div>

          <div className="w-full max-w-[400px]">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter">
                Masuk<span className="text-[#E02F75]">.</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Selamat datang kembali! Gunakan detail akun Anda untuk mengakses
                dashboard.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100">
              <LoginForm
                formData={formData}
                isLoading={isLoading}
                showPassword={showPassword}
                onInputChange={handleInputChange}
                onTogglePassword={togglePasswordVisibility}
                onSubmit={handleSubmit}
              />

              <div className="relative flex items-center justify-center my-8">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">
                  Atau
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Google Login */}
              <button className="w-full h-12 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 shadow-sm transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.98]">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-gray-700 text-sm font-bold tracking-tight">
                  Lanjutkan dengan Google
                </span>
              </button>
            </div>

            <p className="text-center mt-10 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Butuh bantuan?{" "}
              <a
                href="#"
                className="text-[#E02F75] hover:text-[#FF5A57] transition-all underline underline-offset-4 decoration-[#E02F75]/20"
              >
                Hubungi Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
