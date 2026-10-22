"use client";

import React, { useState, useMemo } from "react";
import { EmployeeList } from "./EmployeeList";
import { Employee } from "@/shared/types/employee.types";
import { deleteEmployeeAction, promoteEmployeeAction } from "@/server/modules/employees/employee.actions";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "sonner";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/Page";
import { Button, buttonClass } from "@/shared/components/ui/Button";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { STATUS_LABELS } from "@/shared/components/StatusBadge";
import EmployeesStats from "./EmployeesStats";

const CSV_COLUMNS: CsvColumn<Employee>[] = [
  { header: "NIP", value: (e) => e.nip },
  { header: "Nama", value: (e) => e.name },
  { header: "Email", value: (e) => e.email },
  { header: "Jabatan", value: (e) => e.position },
  { header: "Divisi", value: (e) => e.division },
  { header: "Status", value: (e) => STATUS_LABELS[e.status] ?? e.status },
  { header: "Bergabung", value: (e) => e.joinDate },
];

interface EmployeesClientProps {
  initialEmployees: Employee[];
}

export function EmployeesClient({ initialEmployees }: EmployeesClientProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      const matchesDivision = divisionFilter === "all" || emp.division === divisionFilter;

      return matchesSearch && matchesStatus && matchesDivision;
    });
  }, [employees, searchTerm, statusFilter, divisionFilter]);

  const divisions = useMemo(
    () => Array.from(new Set(employees.map((e) => e.division).filter(Boolean))).sort(),
    [employees],
  );

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteEmployeeAction(deletingId);
      if (result.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== deletingId));
        toast.success(result.message);
      } else {
        toast.error("Tidak dapat menghapus karyawan", { description: result.message, duration: 8000 });
      }
      setIsConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handlePromote = async (id: string) => {
    try {
      const result = await promoteEmployeeAction(id);
      if (result.success) {
        toast.success(result.message || "Status karyawan diubah menjadi aktif");
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: "ACTIVE" } : emp));
      } else {
        toast.error(result.message || "Gagal mengubah status karyawan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <>
      <PageHeader
        title="Karyawan"
        description="Data seluruh karyawan perusahaan"
        actions={
          <>
            <Button variant="secondary" onClick={() => downloadCsv("data-karyawan", filteredEmployees, CSV_COLUMNS)}>
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
            <Link href="/dashboard/employees/new" className={buttonClass()}>
              <Plus className="h-4 w-4" />
              Tambah karyawan
            </Link>
          </>
        }
      />
      <EmployeesStats employees={employees} />
      <EmployeeList
        employees={filteredEmployees}
        divisions={divisions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        divisionFilter={divisionFilter}
        onDivisionChange={setDivisionFilter}
        onDelete={handleDeleteRequest}
        onPromote={handlePromote}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Hapus karyawan"
        message="Hanya karyawan tanpa riwayat absensi, cuti, atau gaji yang bisa dihapus. Akun login-nya ikut terhapus. Untuk karyawan yang keluar, ubah statusnya menjadi Resign atau Diberhentikan."
        isLoading={isDeleting}
        confirmText="HAPUS"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
