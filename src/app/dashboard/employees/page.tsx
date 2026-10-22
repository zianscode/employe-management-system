import React from "react";
import { EmployeesClient } from "@/features/employees/components/EmployeesClient";
import { Page } from "@/shared/components/ui/Page";
import { getEmployeesAction } from "@/server/modules/employees/employee.actions";

export default async function EmployeesPage() {
  const response = await getEmployeesAction();
  const initialEmployees = response.success && response.data ? response.data : [];

  return (
    <Page>
      <EmployeesClient initialEmployees={initialEmployees} />
    </Page>
  );
}
