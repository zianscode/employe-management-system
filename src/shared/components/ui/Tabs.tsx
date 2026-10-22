"use client";

import React from "react";
import { cn } from "@/shared/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("border-b border-gray-200", className)}>
      <nav className="-mb-px flex gap-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                active ? "border-brand text-brand" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
