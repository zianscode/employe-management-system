"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <DialogFooter className="-mx-5 -mb-5 mt-5 px-5 py-3">{children}</DialogFooter>;
}

export function Modal({ isOpen, onClose, title, description, size = "md", children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn("flex max-h-[90vh] flex-col gap-0 p-0", size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg")}
      >
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
