"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/api/session";
import { toast } from "sonner";
import { updatePassword } from "@/lib/api/client";
import { PASSWORD_RULE_TEXT, validatePasswordStrength } from "@/shared/utils/password-policy";
import { PasswordData } from "@/shared/types/profile.types";
import { AuthLayout } from "./AuthLayout";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { FormField } from "@/shared/components/FormField";
import { Button } from "@/shared/components/ui/button";

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
    const res = await updatePassword(form);
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
        <Button variant="link" onClick={() => signOut({ callbackUrl: "/login" })} className="text-muted-foreground">
          Keluar dari akun ini
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map((field) => (
          <FormField key={field.name} label={field.label} htmlFor={field.name} hint={field.hint}>
            <PasswordInput
              id={field.name}
              name={field.name}
              required
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={handleChange}
            />
          </FormField>
        ))}
        <Button type="submit" loading={isLoading} className="w-full">
          Simpan password
        </Button>
      </form>
    </AuthLayout>
  );
}
