import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-gray-400", className)} />;
}

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {Icon && <Icon className="mb-3 h-8 w-8 text-gray-300" />}
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}

type AlertTone = "info" | "warning" | "error" | "success";

const ALERT_TONES: Record<AlertTone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function Alert({ tone = "info", className, children }: { tone?: AlertTone; className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-md border px-4 py-3 text-sm", ALERT_TONES[tone], className)}>{children}</div>;
}
