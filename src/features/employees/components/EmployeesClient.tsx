"use client";

import React, { useState, useMemo } from "react";
import { EmployeeList } from "./EmployeeList";
import { Employee } from "@/shared/types/employee.types";
import { deleteEmployeeAction, promoteEmployeeAction } from "@/server/modules/employees/employee.actions";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "sonner";

interface EmployeesClientProps {
  initialEmployees: Employee[];
}

export function EmployeesClient({ initialEmployees }: EmployeesClientProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  
  // State Modal
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
        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handlePromote = async (id: string) => {
    try {
      const result = await promoteEmployeeAction(id);
      if (result.success) {
        toast.success(result.message || "Karyawan berhasil dipromosikan!");
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: "ACTIVE" } : emp));
      } else {
        toast.error(result.message || "Gagal mempromosikan karyawan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <>
      <EmployeeList
        employees={filteredEmployees}
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
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus data karyawan ini secara permanen? Akun login karyawan ini juga akan dihapus dan tindakan ini tidak dapat dibatalkan."
        isLoading={isDeleting}
        confirmText="HAPUS"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
