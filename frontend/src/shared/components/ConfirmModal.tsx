"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/utils/cn";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  confirmText?: string;
}

const MEDIA_TONES = {
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  variant = "danger",
  isLoading = false,
  confirmText,
}: ConfirmModalProps) {
  const [userInput, setUserInput] = React.useState("");
  const isConfirmDisabled = isLoading || Boolean(confirmText && userInput !== confirmText);

  const close = () => {
    if (isLoading) return;
    setUserInput("");
    onCancel();
  };

  const confirm = () => {
    if (isConfirmDisabled) return;
    onConfirm();
    setUserInput("");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={cn(MEDIA_TONES[variant])}>
            <AlertTriangle />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmText && (
          <div className="grid gap-2">
            <Label htmlFor="confirm-text">
              Ketik <span className="font-semibold">{confirmText}</span> untuk melanjutkan
            </Label>
            <Input
              id="confirm-text"
              value={userInput}
              placeholder={confirmText}
              autoComplete="off"
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={close}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={confirm}
            disabled={isConfirmDisabled}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
