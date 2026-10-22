"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PASSWORD_RULE_TEXT, validatePasswordStrength } from "@/shared/utils/password-policy";
import { validateResetTokenAction, resetPasswordAction } from "@/server/modules/auth/auth.actions";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field, Input } from "@/shared/components/ui/Form";
import { Button, buttonClass } from "@/shared/components/ui/Button";
import { Alert, Spinner } from "@/shared/components/ui/Feedback";

const backToLogin = (
  <Link href="/login" className="text-brand hover:underline">
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
      const response = await validateResetTokenAction(token!);
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

  if (isValidating) return <LoadingState />;

  if (tokenError) {
    return (
      <AuthLayout title="Link tidak bisa dipakai" description={tokenError} footer={backToLogin}>
        <Link href="/auth/forgot-password" className={buttonClass("primary", "md", "w-full")}>
          Minta link baru
        </Link>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password diperbarui" description={`Password untuk ${userEmail} sudah diganti. Silakan login dengan password baru.`}>
        <Link href="/login" className={buttonClass("primary", "md", "w-full")}>
          Ke halaman login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Atur password baru" description={`Untuk akun ${userEmail}`} footer={backToLogin}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Password baru" htmlFor="password" hint={PASSWORD_RULE_TEXT}>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Ulangi password baru" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
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
