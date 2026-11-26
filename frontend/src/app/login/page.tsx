"use client";

import React from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/use-login";
import { BrandLogo } from "@/shared/components/BrandLogo";

export default function LoginPage() {
  const { formData, isLoading, handleInputChange, handleSubmit } = useLogin();

  return (
    <div className="flex min-h-screen bg-card">
      <aside className="hidden w-[44%] flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white p-1">
            <BrandLogo size={32} />
          </div>
          <span className="text-sm font-semibold">Employee Management System</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Absensi, cuti, dan penggajian karyawan dalam satu tempat.</h1>
          <p className="mt-4 text-base text-primary-foreground/75">
            Karyawan mencatat kehadiran dan mengajukan cuti. Atasan dan HR menyetujui, lalu gaji dihitung otomatis sesuai aturan
            BPJS dan PPh 21.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Employee Management System</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandLogo size={32} />
            <span className="text-sm font-semibold text-foreground">Employee Management System</span>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Masuk ke akun Anda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gunakan email kantor dan password yang diberikan HR.</p>

          <div className="mt-8">
            <LoginForm
              formData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">Belum punya akun? Hubungi HR atau admin perusahaan Anda.</p>
        </div>
      </main>
    </div>
  );
}
