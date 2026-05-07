import React from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

export const UserManagement = () => {
  const users = [
    { id: 1, name: "Admin User", email: "admin@company.com", role: "Super Admin", status: "Active", lastLogin: "15 Jan 2024, 09:30" },
    { id: 2, name: "HR Manager", email: "hr@company.com", role: "HR Admin", status: "Active", lastLogin: "15 Jan 2024, 08:45" },
    { id: 3, name: "Finance Staff", email: "finance@company.com", role: "Finance Admin", status: "Inactive", lastLogin: "10 Jan 2024, 14:20" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Manajemen Pengguna Sistem</h3>
            <p className="text-gray-500">Kelola akses dan peran pengguna sistem</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center space-x-2">
          <Plus size={16} />
          <span>Tambah Pengguna</span>
        </button>
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                      {user.name.split(' ').map(n => n[0]).join('')}
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
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
