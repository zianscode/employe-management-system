import React from "react";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";

export type StatTone = "primary" | "success" | "warning" | "destructive" | "info" | "neutral";

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ElementType;
  tone?: StatTone;
  className?: string;
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function StatGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}>{children}</div>;
}
