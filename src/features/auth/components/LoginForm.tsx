import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  isLoading: boolean;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kredensial Akses</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder="admin@gmail.com"
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kata Sandi</label>
          <Link href="/auth/forgot-password" className="text-[10px] text-[#E02F75] hover:text-[#FF5A57] font-black uppercase tracking-widest transition-colors">Lupa?</Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={onInputChange}
            placeholder="••••••••"
            className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 shadow-sm"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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
            Memproses...
          </>
        ) : (
          "Masuk Dashboard"
        )}
      </button>

      <p className="text-center text-xs font-bold text-gray-400 mt-6">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="text-[#E02F75] hover:underline transition-all">Daftar sekarang</Link>
      </p>
    </form>
  );
};
