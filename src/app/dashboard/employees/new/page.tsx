"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { createEmployeeAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { toast } from "sonner";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createEmployeeAction(data);
      if (result.success) {
        toast.success("Karyawan berhasil didaftarkan!", { description: result.message, duration: 8000 });
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
    <div className="py-4 pl-8 pr-6">
      <EmployeeForm
        title="Daftarkan Karyawan Baru"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
