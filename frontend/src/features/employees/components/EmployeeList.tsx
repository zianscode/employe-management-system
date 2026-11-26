import Link from "next/link";
import { Eye, Pencil, Trash2, UserCheck, Users } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { RowActions } from "@/shared/components/RowActions";
import { FilterBar, SearchInput } from "@/shared/components/FilterBar";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { Employee } from "@/shared/types/employee.types";
import { Card, CardFooter } from "@/shared/components/ui/card";
import { NativeSelect } from "@/shared/components/ui/native-select";

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
        <Link href={`/dashboard/employees/${item.id}`} className="group flex items-center gap-3">
          <UserAvatar name={item.name} src={item.avatar || null} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground group-hover:underline">{item.name}</p>
            <p className="truncate text-xs text-muted-foreground">{item.email}</p>
          </div>
        </Link>
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
            <span className="text-xs text-muted-foreground">
              {item.probationDaysLeft <= 0 ? "Masa percobaan selesai" : `Sisa ${item.probationDaysLeft} hari`}
            </span>
          )}
        </div>
      ),
    },
    { header: "Bergabung", accessor: "joinDate" as const },
    {
      header: "",
      className: "w-12",
      accessor: (item: Employee) => (
        <RowActions
          label={`Aksi untuk ${item.name}`}
          actions={[
            { label: "Lihat detail", icon: Eye, href: `/dashboard/employees/${item.id}` },
            { label: "Edit data", icon: Pencil, href: `/dashboard/employees/${item.id}/edit` },
            { label: "Jadikan karyawan tetap", icon: UserCheck, onSelect: () => onPromote(item.id), hidden: !probationFinished(item) },
            { label: "Hapus karyawan", icon: Trash2, onSelect: () => onDelete(item.id), destructive: true },
          ]}
        />
      ),
    },
  ];

  return (
    <Card>
      <FilterBar search={<SearchInput value={searchTerm} onChange={onSearchChange} placeholder="Cari nama, NIP, atau email" />}>
        <NativeSelect className="sm:w-44" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} aria-label="Filter status">
          <option value="all">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="PROBATION">Masa percobaan</option>
          <option value="RESIGNED">Resign</option>
          <option value="TERMINATED">Diberhentikan</option>
        </NativeSelect>
        <NativeSelect className="sm:w-48" value={divisionFilter} onChange={(e) => onDivisionChange(e.target.value)} aria-label="Filter divisi">
          <option value="all">Semua divisi</option>
          {divisions.map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </NativeSelect>
      </FilterBar>

      <DataTable
        columns={columns}
        data={employees}
        emptyIcon={Users}
        emptyMessage="Tidak ada karyawan yang cocok"
        emptyDescription="Ubah kata kunci pencarian atau filter status dan divisi."
      />

      <CardFooter className="text-muted-foreground">{employees.length} karyawan</CardFooter>
    </Card>
  );
};
