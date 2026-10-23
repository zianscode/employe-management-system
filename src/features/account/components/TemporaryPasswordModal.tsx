"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal, ModalActions } from "@/shared/components/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Feedback";

interface TemporaryPasswordModalProps {
  password: string | null;
  employeeName?: string;
  onClose: () => void;
}

export function TemporaryPasswordModal({ password, employeeName, onClose }: TemporaryPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={!!password} onClose={handleClose} title="Password sementara">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Berikan password ini kepada {employeeName ? <span className="font-medium text-gray-900">{employeeName}</span> : "karyawan"}.
          Saat login pertama, karyawan wajib menggantinya.
        </p>
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
          <code className="flex-1 select-all font-mono text-base tracking-wide text-gray-900">{password}</code>
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Tersalin" : "Salin"}
          </Button>
        </div>
        <Alert tone="warning">Password ini hanya ditampilkan sekali. Kalau terlewat, reset lagi dari halaman detail karyawan.</Alert>
        <ModalActions>
          <Button onClick={handleClose}>Sudah saya catat</Button>
        </ModalActions>
      </div>
    </Modal>
  );
}
