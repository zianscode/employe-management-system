"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Form";
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

const ICON_TONES = {
  danger: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  variant = "danger",
  isLoading = false,
  confirmText,
}) => {
  const [userInput, setUserInput] = React.useState("");

  if (!isOpen) return null;

  const isConfirmDisabled = isLoading || Boolean(confirmText && userInput !== confirmText);

  const handleCancel = () => {
    setUserInput("");
    onCancel();
  };

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm();
    setUserInput("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/40" onClick={handleCancel} />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex gap-4 p-5">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", ICON_TONES[variant])}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
            {confirmText && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm text-gray-700">
                  Ketik <span className="font-semibold">{confirmText}</span> untuk melanjutkan
                </label>
                <Input
                  value={userInput}
                  placeholder={confirmText}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-gray-50 px-5 py-3">
          <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} onClick={handleConfirm} disabled={isConfirmDisabled} loading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
