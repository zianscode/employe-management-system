import React from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeTone = "gray" | "green" | "yellow" | "red" | "blue" | "brand";

const TONE_CLASSES: Record<BadgeTone, string> = {
  gray: "bg-gray-50 text-gray-700 ring-gray-500/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  yellow: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  brand: "bg-brand-50 text-brand ring-brand/20",
};

export function Badge({ tone = "gray", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
