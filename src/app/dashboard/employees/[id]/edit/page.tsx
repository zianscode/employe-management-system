"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { getEmployeeByIdAction, updateEmployeeAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { toast } from "sonner";
import { Page } from "@/shared/components/ui/Page";
import { Spinner } from "@/shared/components/ui/Feedback";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<(Partial<EmployeeFormData> & { name: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await getEmployeeByIdAction(id);
      if (res.success && res.data) {
        const d = res.data;
        setEmployee({
          name: d.name,
          email: d.email,
          nip: d.nip,
          gender: d.gender || "MALE",
          birthDate: d.birthDate,
          positionId: d.positionId || "",
          departmentId: d.departmentId || "",
          roleId: d.roleId,
          status: d.status,
          employmentType: d.employmentType,
          joinDate: d.joinDate,
          salaryBase: d.salaryBase,
          managerId: d.managerId,
          ptkpStatus: d.ptkpStatus,
          bpjsKesehatan: d.bpjsKesehatan,
          bpjsKetenagakerjaan: d.bpjsKetenagakerjaan,
        });
      } else {
        toast.error(res.message || "Karyawan tidak ditemukan");
        router.push("/dashboard/employees");
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateEmployeeAction(id, data);
      if (result.success) {
        toast.success("Data karyawan disimpan");
        router.push("/dashboard/employees");
        router.refresh();
      } else {
        toast.error("Gagal memperbarui data", { description: result.message });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Update employee error:", error);
      toast.error("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <Page className="max-w-4xl">
      <EmployeeForm
        title={`Edit ${employee.name}`}
        initialData={employee}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Page>
  );
}
