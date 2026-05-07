import { useState, useMemo } from "react";
import { SalaryRecord } from "../../domain/entities/salary";

// Static salary data defined outside the hook to ensure a stable reference.
// Placing it inside the hook would recreate the array on every render,
// causing useMemo to re-run unnecessarily and triggering linter warnings.
const salaryData: SalaryRecord[] = [
  {
    nip: "EMP001",
    name: "John Doe",
    position: "Software Engineer",
    basicSalary: 8000000,
    allowance: 1500000,
    deduction: 800000,
    totalSalary: 8700000,
    status: "Dibayar",
  },
  {
    nip: "EMP002",
    name: "Jane Smith",
    position: "HR Manager",
    basicSalary: 12000000,
    allowance: 2000000,
    deduction: 1200000,
    totalSalary: 12800000,
    status: "Dibayar",
  },
  {
    nip: "EMP003",
    name: "Mike Johnson",
    position: "Financial Analyst",
    basicSalary: 7000000,
    allowance: 1200000,
    deduction: 700000,
    totalSalary: 7500000,
    status: "Pending",
  },
  {
    nip: "EMP004",
    name: "Sarah Wilson",
    position: "Marketing Specialist",
    basicSalary: 6500000,
    allowance: 1000000,
    deduction: 650000,
    totalSalary: 6850000,
    status: "Dibayar",
  },
  {
    nip: "EMP005",
    name: "David Brown",
    position: "Operations Manager",
    basicSalary: 10000000,
    allowance: 1800000,
    deduction: 1000000,
    totalSalary: 10800000,
    status: "Pending",
  },
];

export function useSalary() {
  const [selectedMonth, setSelectedMonth] = useState("January 2024");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    return salaryData.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "Semua Status" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      totalSalary: salaryData.reduce((sum, emp) => sum + emp.totalSalary, 0),
      basicSalary: salaryData.reduce((sum, emp) => sum + emp.basicSalary, 0),
      totalAllowance: salaryData.reduce((sum, emp) => sum + emp.allowance, 0),
      totalDeduction: salaryData.reduce((sum, emp) => sum + emp.deduction, 0),
    };
  }, []);

  return {
    data: filteredData,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    totalCount: salaryData.length,
    filteredCount: filteredData.length,
  };
}
