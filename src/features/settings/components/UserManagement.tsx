"use client";

import React, { useState, useMemo } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DataTable } from "@/shared/components/DataTable";
import { deleteUserAction } from "@/server/modules/settings/user.actions";
import { SystemUser } from "@/shared/types/settings.types";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Form";
import { Badge } from "@/shared/components/ui/Badge";
import { Avatar } from "@/shared/components/ui/Avatar";

interface UserManagementProps {
  users: SystemUser[];
  onRefresh: () => void;
}

export const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserAction(deletingId);
      if (res.success) {
        toast.success("Akun pengguna dihapus");
        onRefresh();
        setDeletingId(null);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }, [users, searchTerm]);

  return (
    <Card>
      <CardHeader
        title="Pengguna"
        description="Akun yang bisa login ke sistem"
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
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ),
          },
          { header: "Peran", accessor: (user: SystemUser) => <Badge tone="brand">{user.role}</Badge> },
          {
            header: "Status",
            accessor: (user: SystemUser) =>
              user.status === "Active" ? <Badge tone="green">Aktif</Badge> : <Badge>{user.status}</Badge>,
          },
          { header: "Login terakhir", accessor: "lastLogin" },
          {
            header: "",
            accessor: (user: SystemUser) => (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingId(user.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Hapus akun"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus akun pengguna"
        message="Akun ini akan dihapus permanen dan tidak bisa login lagi."
        confirmText="HAPUS"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Card>
  );
};
