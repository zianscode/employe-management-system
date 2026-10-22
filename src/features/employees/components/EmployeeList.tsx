import Link from "next/link";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Employee } from "@/shared/types/employee.types";
import { Card } from "@/shared/components/ui/Card";
import { Input, Select } from "@/shared/components/ui/Form";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";

interface EmployeeListProps {
  employees: Employee[];
  divisions: string[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  divisionFilter: string;
  onDivisionChange: (val: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}

const iconButton = "rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700";

function probationFinished(item: Employee) {
  return item.status === "PROBATION" && item.probationDaysLeft != null && item.probationDaysLeft <= 0;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  divisions,
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
    {
      header: "Karyawan",
      accessor: (item: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} src={item.avatar || null} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    { header: "NIP", accessor: "nip" as const, className: "tabular-nums" },
    { header: "Jabatan", accessor: "position" as const },
    { header: "Divisi", accessor: "division" as const },
    {
      header: "Status",
      accessor: (item: Employee) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={item.status} />
          {item.status === "PROBATION" && item.probationDaysLeft != null && (
            <span className="text-xs text-gray-500">
              {item.probationDaysLeft <= 0 ? "Masa percobaan selesai" : `Sisa ${item.probationDaysLeft} hari`}
            </span>
          )}
        </div>
      ),
    },
    { header: "Bergabung", accessor: "joinDate" as const },
    {
      header: "",
      className: "text-right",
      accessor: (item: Employee) => (
        <div className="flex items-center justify-end gap-1">
          {probationFinished(item) && (
            <Button size="sm" variant="secondary" onClick={() => onPromote(item.id)}>
              Jadikan tetap
            </Button>
          )}
          <Link href={`/dashboard/employees/${item.id}`} className={iconButton} title="Lihat detail">
            <Eye className="h-4 w-4" />
          </Link>
          <Link href={`/dashboard/employees/${item.id}/edit`} className={iconButton} title="Edit">
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, NIP, atau email"
            className="pl-9 sm:max-w-xs"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select className="sm:w-44" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="all">Semua status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PROBATION">Masa percobaan</option>
            <option value="RESIGNED">Resign</option>
            <option value="TERMINATED">Diberhentikan</option>
          </Select>
          <Select className="sm:w-48" value={divisionFilter} onChange={(e) => onDivisionChange(e.target.value)}>
            <option value="all">Semua divisi</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable columns={columns} data={employees} emptyMessage="Tidak ada karyawan yang cocok" />

      <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">{employees.length} karyawan</div>
    </Card>
  );
};
