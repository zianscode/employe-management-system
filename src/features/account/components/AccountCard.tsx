"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LockOpen } from "lucide-react";
import { AccountInfo } from "@/shared/types/settings.types";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useAccountActions } from "@/features/account/hooks/use-account-actions";
import { AccountStateBadge } from "./AccountStateBadge";
import { TemporaryPasswordModal } from "./TemporaryPasswordModal";

const STATE_HINT: Record<AccountInfo["state"], string> = {
  ACTIVE: "Karyawan bisa login seperti biasa.",
  INACTIVE: "Status karyawan Resign atau Diberhentikan, jadi tidak bisa login.",
  LOCKED: "Terlalu banyak salah password. Buka kunci kalau karyawan sudah menghubungi Anda.",
  MUST_CHANGE_PASSWORD: "Karyawan belum login pertama kali atau belum mengganti password sementara.",
};

interface AccountCardProps {
  account: AccountInfo | null;
  employeeName: string;
}

export function AccountCard({ account, employeeName }: AccountCardProps) {
  const router = useRouter();
  const actions = useAccountActions(() => router.refresh());

  return (
    <Card>
      <CardHeader title="Akun login" />
      <CardBody className="space-y-4">
        {!account ? (
          <p className="text-sm text-gray-500">Karyawan ini belum punya akun login.</p>
        ) : (
          <>
            <div>
              <AccountStateBadge account={account} />
              <p className="mt-2 text-sm text-gray-500">{STATE_HINT[account.state]}</p>
            </div>
            {account.state !== "INACTIVE" && (
              <div className="flex flex-wrap gap-2">
                {account.state === "LOCKED" && (
                  <Button size="sm" variant="secondary" onClick={() => actions.unlock(account.userId)} disabled={actions.isProcessing}>
                    <LockOpen className="h-4 w-4" />
                    Buka kunci
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => actions.requestReset({ userId: account.userId, name: employeeName })}
                >
                  <KeyRound className="h-4 w-4" />
                  Reset password
                </Button>
              </div>
            )}
          </>
        )}
      </CardBody>

      <ConfirmModal
        isOpen={!!actions.resetTarget}
        title="Reset password?"
        message={`Password ${employeeName} akan diganti dengan password sementara baru. Password lama tidak bisa dipakai lagi.`}
        confirmLabel="Reset password"
        variant="warning"
        isLoading={actions.isProcessing}
        onConfirm={actions.confirmReset}
        onCancel={actions.cancelReset}
      />
      <TemporaryPasswordModal
        password={actions.temporaryPassword?.password ?? null}
        employeeName={actions.temporaryPassword?.name}
        onClose={actions.closeTemporaryPassword}
      />
    </Card>
  );
}
