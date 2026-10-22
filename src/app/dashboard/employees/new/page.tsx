"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { createEmployeeAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { toast } from "sonner";
import { Page } from "@/shared/components/ui/Page";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createEmployeeAction(data);
      if (result.success) {
        toast.success("Karyawan ditambahkan", {
          description: `${result.message}. Catat dan berikan kepada karyawan, password ini hanya ditampilkan sekali.`,
          duration: Infinity,
          closeButton: true,
        });
        router.push("/dashboard/employees");
        router.refresh();
      } else {
        toast.error("Gagal mendaftarkan karyawan", { description: result.message });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <Page className="max-w-4xl">
      <EmployeeForm
        title="Tambah karyawan"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Page>
  );
}
