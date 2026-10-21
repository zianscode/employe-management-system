import Link from "next/link";
import { Search, Pencil, Eye } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Employee } from "@/shared/types/employee.types";

interface EmployeeListProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  divisionFilter: string;
  onDivisionChange: (val: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}

const getAvatarGradient = (index: number) => {
  const gradients = [
    "from-brand to-brand-dark",
    "from-accent to-accent-dark",
    "from-brand-light to-brand",
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
  onDelete,
  onPromote,
}) => {
  const columns = [
    { header: "NIP", accessor: "nip" as const, className: "font-medium text-gray-900" },
    {
      header: "Nama",
      accessor: (item: Employee) => (
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
              employees.indexOf(item)
            )} flex items-center justify-center text-white font-semibold text-sm mr-3 uppercase`}
          >
            {item.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
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
      accessor: (item: Employee) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={item.status} />
          {item.status === "PROBATION" && item.probationDaysLeft !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border ${
              item.probationDaysLeft !== null && item.probationDaysLeft <= 0
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
              {item.probationDaysLeft !== null && item.probationDaysLeft <= 0
                ? "Selesai Masa Percobaan"
                : `Sisa ${item.probationDaysLeft} hari`}
            </span>
          )}
        </div>
      ),
    },
    { header: "Bergabung", accessor: "joinDate" as const },
    {
      header: "Aksi",
      accessor: (item: Employee) => (
        <div className="flex items-center gap-2">
          {item.status === "PROBATION" && item.probationDaysLeft !== null && item.probationDaysLeft !== undefined && item.probationDaysLeft <= 0 && (
            <button
              onClick={() => onPromote(item.id)}
              className="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              title="Promosikan ke Karyawan Aktif"
            >
              Promosi
            </button>
          )}
          <Link 
            href={`/dashboard/employees/${item.id}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Detail"
          >
            <Eye size={18} />
          </Link>
          <Link 
            href={`/dashboard/employees/${item.id}/edit`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={18} />
          </Link>
          <button 
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand outline-none w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand outline-none bg-white"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PROBATION">Probasi</option>
              <option value="RESIGNED">Resigned</option>
            </select>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand outline-none bg-white"
              value={divisionFilter}
              onChange={(e) => onDivisionChange(e.target.value)}
            >
              <option value="all">Semua Divisi</option>
              <option value="Teknologi Informasi">IT</option>
              <option value="Sumber Daya Manusia">HR</option>
              <option value="Direksi">Direksi</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={employees} emptyMessage="Tidak ada karyawan ditemukan" />
    </div>
  );
};
