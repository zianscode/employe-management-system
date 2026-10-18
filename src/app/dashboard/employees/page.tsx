import React from "react";
import EmployeesHeader from "@/features/employees/components/EmployeesHeader";
import EmployeesStats from "@/features/employees/components/EmployeesStats";
import { EmployeesClient } from "@/features/employees/components/EmployeesClient";
import { getEmployeesAction } from "@/server/modules/employees/employee.actions";

export default async function EmployeesPage() {
  const response = await getEmployeesAction();
  const initialEmployees = response.success && response.data ? response.data : [];

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <EmployeesHeader />
      <EmployeesStats employees={initialEmployees} />
      <div className="pb-10">
        <EmployeesClient initialEmployees={initialEmployees} />
      </div>
    </div>
  );
}
