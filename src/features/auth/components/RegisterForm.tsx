import React, { useState } from "react";
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface RegisterFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ isLoading, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Budi Santoso"
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
          <input
            type="email"
            name="email"
            required
            placeholder="budi@gmail.com"
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Min. 8 Karakter"
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Konfirmasi Sandi</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              placeholder="Ulangi Sandi"
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 bg-gradient-to-r from-[#FF5A57] to-[#E02F75] text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_12px_24px_-8px_rgba(224,47,117,0.4)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Mendaftarkan...
          </>
        ) : (
          <>
            Daftar Sekarang
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-xs font-bold text-gray-400 mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-[#E02F75] hover:underline">Masuk di sini</Link>
      </p>
    </form>
  );
};
