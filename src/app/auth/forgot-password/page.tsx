"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/modules/auth/auth.actions";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field, Input } from "@/shared/components/ui/Form";
import { Button, buttonClass } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Feedback";

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

  const backToLogin = (
    <Link href="/login" className="text-brand hover:underline">
      Kembali ke halaman login
    </Link>
  );

  if (isSubmitted) {
    return (
      <AuthLayout title="Cek email Anda" description={message} footer={backToLogin}>
        <Link href="/login" className={buttonClass("secondary", "md", "w-full")}>
          Kembali ke login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Lupa password"
      description="Masukkan email akun Anda. Kami akan mengirim link untuk membuat password baru."
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@perusahaan.com"
          />
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={isLoading} className="w-full">
          Kirim link reset
        </Button>
      </form>
    </AuthLayout>
  );
}
