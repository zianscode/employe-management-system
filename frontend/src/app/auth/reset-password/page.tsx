"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PASSWORD_RULE_TEXT, validatePasswordStrength } from "@/shared/utils/password-policy";
import { validateResetToken, resetPassword } from "@/lib/api/client";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { FormField } from "@/shared/components/FormField";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Alert } from "@/shared/components/ui/alert";

const backToLogin = (
  <Link href="/login" className="text-primary hover:underline">
    Kembali ke halaman login
  </Link>
);

function LoadingState() {
  return (
    <AuthLayout title="Atur password baru">
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    </AuthLayout>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError("Link reset tidak lengkap.");
      setIsValidating(false);
      return;
    }

    async function validate() {
      const response = await validateResetToken(token!);
      if (response.success && response.data) {
        setUserEmail(response.data.email);
      } else {
        setTokenError(response.message);
      }
      setIsValidating(false);
    }

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password tidak sama.");
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
      const response = await resetPassword(token!, password);
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

  if (isValidating) return <LoadingState />;

  if (tokenError) {
    return (
      <AuthLayout title="Link tidak bisa dipakai" description={tokenError} footer={backToLogin}>
        <Link href="/auth/forgot-password" className={buttonVariants({ className: "w-full" })}>
          Minta link baru
        </Link>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password diperbarui" description={`Password untuk ${userEmail} sudah diganti. Silakan login dengan password baru.`}>
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Ke halaman login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Atur password baru" description={`Untuk akun ${userEmail}`} footer={backToLogin}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Password baru" htmlFor="password" hint={PASSWORD_RULE_TEXT}>
          <PasswordInput
            id="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField label="Ulangi password baru" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button type="submit" loading={isLoading} className="w-full">
          Simpan password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
