"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SystemUser } from "@/shared/types/settings.types";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Form";
import { Badge } from "@/shared/components/ui/Badge";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { AccountStateBadge } from "@/features/account/components/AccountStateBadge";
import { TemporaryPasswordModal } from "@/features/account/components/TemporaryPasswordModal";
import { useAccountActions } from "@/features/account/hooks/use-account-actions";

interface UserManagementProps {
  users: SystemUser[];
  onRefresh: () => void;
}

export const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const actions = useAccountActions(onRefresh);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }, [users, searchTerm]);

  return (
    <Card>
      <CardHeader
        title="Pengguna"
        description="Akun login karyawan. Untuk menambah atau menonaktifkan akun, kelola data karyawannya di menu Karyawan."
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama atau email"
              className="h-8 w-56 pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      <DataTable
        data={filteredUsers}
        emptyMessage="Tidak ada pengguna"
        columns={[
          {
            header: "Pengguna",
            accessor: (user: SystemUser) => (
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name}
                    {user.isSelf && <span className="ml-1.5 text-xs font-normal text-gray-500">(Anda)</span>}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ),
          },
          { header: "Peran", accessor: (user: SystemUser) => <Badge tone="brand">{user.role}</Badge> },
          { header: "Status akun", accessor: (user: SystemUser) => <AccountStateBadge account={user} /> },
          {
            header: "",
            accessor: (user: SystemUser) =>
              user.isSelf || user.state === "INACTIVE" ? null : (
                <div className="flex items-center justify-end gap-2">
                  {user.state === "LOCKED" && (
                    <Button size="sm" variant="secondary" onClick={() => actions.unlock(user.userId)} disabled={actions.isProcessing}>
                      Buka kunci
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => actions.requestReset({ userId: user.userId, name: user.name })}>
                    Reset password
                  </Button>
                  {user.employeeId && (
                    <Link href={`/dashboard/employees/${user.employeeId}`} className="text-sm font-medium text-brand hover:underline">
                      Data karyawan
                    </Link>
                  )}
                </div>
              ),
          },
        ]}
      />

      <ConfirmModal
        isOpen={!!actions.resetTarget}
        title="Reset password?"
        message={`Password ${actions.resetTarget?.name ?? ""} akan diganti dengan password sementara baru. Password lama tidak bisa dipakai lagi.`}
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
};
