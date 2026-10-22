"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { updatePasswordAction } from "@/server/modules/profile/profile.actions";
import { PASSWORD_RULE_TEXT, validatePasswordStrength } from "@/shared/utils/password-policy";
import { PasswordData } from "@/shared/types/profile.types";
import { AuthLayout } from "./AuthLayout";
import { Field, Input } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";

const FIELDS: { name: keyof PasswordData; label: string; hint?: string; autoComplete: string }[] = [
  { name: "currentPassword", label: "Password sementara", autoComplete: "current-password" },
  { name: "newPassword", label: "Password baru", hint: PASSWORD_RULE_TEXT, autoComplete: "new-password" },
  { name: "confirmPassword", label: "Ulangi password baru", autoComplete: "new-password" },
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
    <AuthLayout
      title="Ganti password"
      description="Akun Anda masih memakai password sementara. Ganti dulu sebelum melanjutkan."
      footer={
        <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="text-gray-500 hover:text-gray-900">
          Keluar
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map((field) => (
          <Field key={field.name} label={field.label} htmlFor={field.name} hint={field.hint}>
            <Input
              id={field.name}
              type="password"
              name={field.name}
              required
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={handleChange}
            />
          </Field>
        ))}
        <Button type="submit" loading={isLoading} className="w-full">
          Simpan password
        </Button>
      </form>
    </AuthLayout>
  );
}
