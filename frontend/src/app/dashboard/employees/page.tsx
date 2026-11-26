import React from "react";
import { EmployeesClient } from "@/features/employees/components/EmployeesClient";
import { Page } from "@/shared/components/PageLayout";
import { getEmployees } from "@/lib/api/server";

export default async function EmployeesPage() {
  const response = await getEmployees();
  const initialEmployees = response.success && response.data ? response.data : [];

  return (
    <Page>
      <EmployeesClient initialEmployees={initialEmployees} />
    </Page>
  );
}
