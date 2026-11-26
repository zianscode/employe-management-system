"use client";

import React, { useState, useMemo } from "react";
import { EmployeeList } from "./EmployeeList";
import { Employee } from "@/shared/types/employee.types";
import { deleteEmployee, promoteEmployee } from "@/lib/api/client";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "sonner";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageLayout";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { downloadCSV } from "@/lib/api/download";
import EmployeesStats from "./EmployeesStats";

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
      const result = await deleteEmployee(deletingId);
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
      const result = await promoteEmployee(id);
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
            <Button variant="outline" onClick={() => downloadCSV("/employees.csv", { q: searchTerm, status: statusFilter, division: divisionFilter })}>
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
            <Link href="/dashboard/employees/new" className={buttonVariants()}>
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
