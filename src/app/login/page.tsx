"use client";

import React from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/presentation/components/LoginForm";
import { useLogin } from "@/features/auth/presentation/hooks/useLogin";

export default function LoginPage() {
  const {
    formData,
    showPassword,
    isLoading,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  const colorPalette = {
    gradient: "linear-gradient(135deg, #FF5A57, #E02F75, #6700A3, #050C38)",
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden max-w-6xl w-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Selamat datang kembali!</h2>
          <p className="text-lg text-gray-500 mb-8">
            Silakan masukkan kredensial Anda untuk mengakses dashboard.
          </p>

          <LoginForm
            formData={formData}
            isLoading={isLoading}
            showPassword={showPassword}
            onInputChange={handleInputChange}
            onTogglePassword={togglePasswordVisibility}
            onSubmit={handleSubmit}
          />

          <div className="flex items-center justify-center my-8">
            <span className="text-gray-400 text-sm">atau lanjutkan dengan</span>
          </div>

          <div className="flex justify-center space-x-4">
            {/* Social login buttons simplified for brevity but kept functional */}
            {["Google", "Apple", "Facebook"].map((platform) => (
              <button key={platform} className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full hover:bg-gray-200 transition shadow-md">
                <span className="sr-only">{platform}</span>
                <div className="w-7 h-7 bg-gray-300 rounded-sm"></div> {/* Placeholder for icons */}
              </button>
            ))}
          </div>

          <div className="text-center mt-8 text-gray-500">
            Belum punya akun?{" "}
            <a href="#" className="text-[#E02F75] hover:underline font-medium">Daftar sekarang</a>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div
          className="hidden lg:flex w-1/2 items-center justify-center p-12 rounded-l-3xl"
          style={{ background: colorPalette.gradient }}
        >
          <div className="text-center text-white p-6">
            <div className="relative w-full max-w-sm mx-auto mb-8 aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/assets/login.png"
                alt="Login Illustration"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Manajemen Karyawan Terpusat dan Efisien
            </h3>
            <p className="text-xl">dengan Sistem Manajemen Karyawan</p>
          </div>
        </div>
      </div>
    </div>
  );
}