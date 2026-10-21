"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/server/modules/auth/auth.actions";
import { BRAND_COLORS } from "@/shared/constants/theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await forgotPasswordAction(email);
      if (response.success) {
        setIsSubmitted(true);
        setMessage(response.message);
      } else {
        setError(response.message);
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white flex items-center justify-center p-6 selection:bg-brand/10">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="absolute top-0 right-0 h-full w-[100%] opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0 C 50 50, 50 50, 100 100 L 100 0 Z" fill="url(#grad)" />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={BRAND_COLORS.brand} />
              <stop offset="100%" stopColor={BRAND_COLORS.brandDark} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">Lupa Password<span className="text-brand">?</span></h1>
          <p className="text-gray-500 text-sm font-medium">Jangan khawatir, kami akan membantu Anda mereset password akun Anda.</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] border border-gray-100">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Terdaftar</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-brand/50 focus:ring-4 focus:ring-brand/5 outline-none text-gray-900 font-medium transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="pt-2 space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent via-brand to-brand-dark text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_12px_24px_-8px_rgba(224,47,117,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Memproses...
                    </>
                  ) : (
                    "Kirim Instruksi Reset"
                  )}
                </button>

                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900 text-[10px] font-black uppercase tracking-widest transition-colors py-2 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-100">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Email Terkirim!</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                {message}
              </p>
              <Link
                href="/login"
                className="inline-block w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Kembali ke Login
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
