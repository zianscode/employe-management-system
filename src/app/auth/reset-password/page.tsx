"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, Loader2, CheckCircle2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { validatePasswordStrength } from "@/shared/utils/password-policy";
import { validateResetTokenAction, resetPasswordAction } from "@/server/modules/auth/auth.actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token reset tidak ditemukan.");
      setIsValidating(false);
      return;
    }

    async function validate() {
      const response = await validateResetTokenAction(token!);
      if (response.success && response.data) {
        setUserEmail(response.data.email);
      } else {
        setError(response.message);
      }
      setIsValidating(false);
    }

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      setError(strengthError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await resetPasswordAction(token!, password);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message);
      }
    } catch {
      setError("Gagal mereset password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="animate-spin text-brand mb-4" size={40} />
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Memvalidasi Token...</p>
      </div>
    );
  }

  if (error && !isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Terjadi Kesalahan</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{error}</p>
        <div className="space-y-4">
          <Link href="/auth/forgot-password" className="inline-block w-full bg-brand text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent transition-all">
            Minta Token Baru
          </Link>
          <Link href="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900 text-[10px] font-black uppercase tracking-widest transition-colors py-2 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-100">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Password Diperbarui!</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
          Password akun {userEmail} berhasil diubah. Silakan login kembali dengan password baru Anda.
        </p>
        <Link href="/login" className="inline-block w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mereset Password Untuk</p>
        <p className="text-sm font-bold text-gray-900">{userEmail}</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password Baru</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-brand/50 focus:ring-4 focus:ring-brand/5 outline-none text-gray-900 font-medium transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Konfirmasi Password</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-brand/50 focus:ring-4 focus:ring-brand/5 outline-none text-gray-900 font-medium transition-all shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-accent via-brand to-brand-dark text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_12px_24px_-8px_rgba(224,47,117,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Memperbarui...
          </>
        ) : (
          "Simpan Password Baru"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white flex items-center justify-center p-6 selection:bg-brand/10">
      <div className="relative z-10 w-full max-w-[450px]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">Atur Password Baru<span className="text-brand">.</span></h1>
          <p className="text-gray-500 text-sm font-medium">Pastikan password baru Anda aman dan mudah diingat.</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] border border-gray-100">
          <Suspense fallback={
             <div className="flex flex-col items-center justify-center py-10">
               <Loader2 className="animate-spin text-brand mb-4" size={40} />
               <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Loading...</p>
             </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-12 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
          EMS<span className="text-brand">.</span>PRO Security Protocol
        </p>
      </div>
    </div>
  );
}
