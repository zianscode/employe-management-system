"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabNavProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function TabNav<T extends string>({ tabs, value, onChange }: TabNavProps<T>) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as T)}>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
