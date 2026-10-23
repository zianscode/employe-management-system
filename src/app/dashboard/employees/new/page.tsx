"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { TemporaryPasswordModal } from "@/features/account/components/TemporaryPasswordModal";
import { createEmployeeAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { Page } from "@/shared/components/ui/Page";

interface CreatedEmployee {
  id: string;
  name: string;
  temporaryPassword: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedEmployee | null>(null);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createEmployeeAction(data);
      if (result.success && result.data) {
        toast.success(result.message);
        setCreated({ id: result.data.id, name: data.name, temporaryPassword: result.data.temporaryPassword });
      } else {
        toast.error("Gagal menambah karyawan", { description: result.message });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!created) return;
    router.push(`/dashboard/employees/${created.id}`);
    router.refresh();
  };

  return (
    <Page className="max-w-4xl">
      <EmployeeForm title="Tambah karyawan" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <TemporaryPasswordModal
        password={created?.temporaryPassword ?? null}
        employeeName={created?.name}
        onClose={handleCloseModal}
      />
    </Page>
  );
}
