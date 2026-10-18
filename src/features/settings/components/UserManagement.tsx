"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { deleteUserAction } from "@/server/modules/settings/user.actions";
import { toast } from "sonner";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

export const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserAction(deletingId);
      if (res.success) {
        toast.success("Akun pengguna berhasil dihapus");
        onRefresh();
        setIsConfirmOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Daftar Pengguna Sistem</h3>
            <p className="text-gray-500">Lihat akses dan peran pengguna sistem</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari user..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="py-4 px-2 text-sm font-medium text-gray-500">Pengguna</th>
              <th className="py-4 px-2 text-sm font-medium text-gray-500">Peran</th>
              <th className="py-4 px-2 text-sm font-medium text-gray-500">Status</th>
              <th className="py-4 px-2 text-sm font-medium text-gray-500">Login Terakhir</th>
              <th className="py-4 px-2 text-sm font-medium text-gray-500 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-2 text-sm text-gray-600">{user.lastLogin}</td>
                <td className="py-4 px-2 text-right">
                  <button 
                    onClick={() => onDelete(user.id.toString())}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Akun"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen? Pengguna ini tidak akan bisa login kembali ke sistem."
        confirmText="HAPUS"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
