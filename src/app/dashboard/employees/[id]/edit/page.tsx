"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { getEmployeeById, updateEmployee } from "@/server/modules/employees/employee.actions";
import { Employee, EmployeeFormData } from "@/shared/types/employee.types";
import { toast } from "sonner";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = await getEmployeeById(id);
      if (data) {
        setEmployee(data);
      } else {
        toast.error("Karyawan tidak ditemukan");
        router.push("/dashboard/employees");
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateEmployee(id, data);
      if (result.success) {
        toast.success("Data karyawan diperbarui!");
        router.push("/dashboard/employees");
        router.refresh();
      } else {
        toast.error("Gagal memperbarui data: " + result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Update employee error:", error);
      toast.error("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-[#E02F75] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!employee) return null;

  return (
    <div className="py-4 pl-8 pr-6">
      <EmployeeForm 
        title={`Edit Data: ${employee.name}`}
        initialData={employee as unknown as EmployeeFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
