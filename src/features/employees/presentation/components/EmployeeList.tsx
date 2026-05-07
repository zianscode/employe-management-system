import React from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Employee } from "@/features/employees/domain/entities/employee";

interface EmployeeListProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  divisionFilter: string;
  onDivisionChange: (val: string) => void;
}

const getAvatarGradient = (index: number) => {
  const gradients = [
    "from-pink-500 to-purple-600",
    "from-purple-500 to-indigo-600",
    "from-indigo-500 to-blue-600",
    "from-blue-500 to-cyan-600",
    "from-cyan-500 to-teal-600",
  ];
  return gradients[index % gradients.length];
};

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  divisionFilter,
  onDivisionChange,
}) => {
  const columns = [
    { header: "NIP", accessor: "id" as const, className: "font-medium text-gray-900" },
    {
      header: "Nama",
      accessor: (item: Employee) => (
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
              employees.indexOf(item)
            )} flex items-center justify-center text-white font-semibold text-sm mr-3`}
          >
            {item.avatar}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    { header: "Jabatan", accessor: "position" as const },
    { header: "Divisi", accessor: "division" as const },
    {
      header: "Status",
      accessor: (item: Employee) => <StatusBadge status={item.status} />,
    },
    { header: "Bergabung", accessor: "joinDate" as const },
    {
      header: "Aksi",
      accessor: () => (
        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
          <MoreHorizontal size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Daftar Karyawan</h2>
            <p className="text-gray-500">Total {employees.length} karyawan ditemukan</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari..."
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              value={divisionFilter}
              onChange={(e) => onDivisionChange(e.target.value)}
            >
              <option value="all">Semua Divisi</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={employees} emptyMessage="Tidak ada karyawan ditemukan" />
    </div>
  );
};
