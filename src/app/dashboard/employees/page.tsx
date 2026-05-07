"use client";

import React from "react";
import EmployeesHeader from "@/features/employees/presentation/components/EmployeesHeader";
import EmployeesStats from "@/features/employees/presentation/components/EmployeesStats";
import { EmployeeList } from "@/features/employees/presentation/components/EmployeeList";
import { useEmployees } from "@/features/employees/presentation/hooks/useEmployees";

export default function EmployeesPage() {
  const {
    employees,
    searchTerm,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    divisionFilter,
    setDivisionFilter,
  } = useEmployees();

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <EmployeesHeader />

      <EmployeesStats />

      <div className="pb-10">
        <EmployeeList
          employees={employees}
          searchTerm={searchTerm}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          divisionFilter={divisionFilter}
          onDivisionChange={setDivisionFilter}
        />
      </div>
    </div>
  );
}
