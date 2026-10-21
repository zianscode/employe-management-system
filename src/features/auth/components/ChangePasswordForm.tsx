"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePasswordAction } from "@/server/modules/profile/profile.actions";
import { PASSWORD_RULE_TEXT, validatePasswordStrength } from "@/shared/utils/password-policy";
import { PasswordData } from "@/shared/types/profile.types";

const inputClass =
  "w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium";

const FIELDS: { name: keyof PasswordData; label: string }[] = [
  { name: "currentPassword", label: "Password Sementara" },
  { name: "newPassword", label: "Password Baru" },
  { name: "confirmPassword", label: "Konfirmasi Password Baru" },
];

export function ChangePasswordForm() {
  const router = useRouter();
  const { update } = useSession();
  const [form, setForm] = useState<PasswordData>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }
    const strengthError = validatePasswordStrength(form.newPassword);
    if (strengthError) {
      toast.error(strengthError);
      return;
    }

    setIsLoading(true);
    const res = await updatePasswordAction(form);
    if (res.success) {
      toast.success("Password berhasil diganti");
      await update();
      router.replace("/dashboard");
      router.refresh();
    } else {
      toast.error(res.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand/10 text-brand">
          <KeyRound size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Ganti Password</h1>
          <p className="text-sm text-gray-500">Demi keamanan, ganti password sementara Anda sebelum melanjutkan.</p>
        </div>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">{field.label}</label>
          <input
            type="password"
            name={field.name}
            required
            value={form[field.name]}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      ))}

      <p className="text-xs text-gray-500 ml-1">{PASSWORD_RULE_TEXT}</p>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin" size={18} />}
        Simpan Password Baru
      </button>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full text-sm font-bold text-gray-400 hover:text-gray-600"
      >
        Keluar
      </button>
    </form>
  );
}
