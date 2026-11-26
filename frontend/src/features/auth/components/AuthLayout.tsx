import React from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <BrandLogo size={32} />
          <span className="text-sm font-semibold text-foreground">Employee Management System</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
