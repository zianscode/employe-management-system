import React from "react";
import { cn } from "@/shared/utils/cn";

export interface DescriptionItem {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}

interface DescriptionListProps {
  items: DescriptionItem[];
  columns?: 1 | 2;
  className?: string;
}

export function DescriptionList({ items, columns = 2, className }: DescriptionListProps) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className={cn(item.wide && "sm:col-span-2")}>
          <dt className="text-sm text-gray-500">{item.label}</dt>
          <dd className="mt-1 text-sm text-gray-900">{item.value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}
