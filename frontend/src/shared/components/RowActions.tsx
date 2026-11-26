"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: React.ElementType;
  href?: string;
  onSelect?: () => void;
  destructive?: boolean;
  hidden?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
  label?: string;
}

export function RowActions({ actions, label = "Aksi" }: RowActionsProps) {
  const visible = actions.filter((action) => !action.hidden);
  const regular = visible.filter((action) => !action.destructive);
  const destructive = visible.filter((action) => action.destructive);

  if (visible.length === 0) return null;

  const renderItem = ({ label: itemLabel, icon: Icon, href, onSelect, destructive: isDestructive }: RowAction) => (
    <DropdownMenuItem
      key={itemLabel}
      variant={isDestructive ? "destructive" : "default"}
      asChild={Boolean(href)}
      onSelect={href ? undefined : onSelect}
    >
      {href ? (
        <Link href={href}>
          {Icon && <Icon />}
          {itemLabel}
        </Link>
      ) : (
        <>
          {Icon && <Icon />}
          {itemLabel}
        </>
      )}
    </DropdownMenuItem>
  );

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {regular.map(renderItem)}
          {regular.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
          {destructive.map(renderItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
