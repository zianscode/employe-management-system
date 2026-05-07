import { useState, useMemo } from "react";
import { Employee } from "@/features/employees/domain/entities/employee";

const EMPLOYEES_DATA: Employee[] = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    position: "Software Engineer",
    division: "IT",
    status: "Aktif",
    joinDate: "15/1/2023",
    avatar: "JD",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    position: "HR Manager",
    division: "HR",
    status: "Aktif",
    joinDate: "20/3/2022",
    avatar: "JS",
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    position: "Financial Analyst",
    division: "Finance",
    status: "Cuti",
    joinDate: "10/6/2023",
    avatar: "MJ",
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    position: "Marketing Specialist",
    division: "Marketing",
    status: "Aktif",
    joinDate: "28/2/2023",
    avatar: "SW",
  },
  {
    id: "EMP005",
    name: "David Brown",
    email: "david.brown@company.com",
    position: "Operations Manager",
    division: "Operations",
    status: "Non-Aktif",
    joinDate: "5/11/2021",
    avatar: "DB",
  },
];

export function useEmployees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES_DATA.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      const matchesDivision =
        divisionFilter === "all" || employee.division === divisionFilter;

      return matchesSearch && matchesStatus && matchesDivision;
    });
  }, [searchTerm, statusFilter, divisionFilter]);

  return {
    employees: filteredEmployees,
    searchTerm,
    setSearchQuery: setSearchTerm,
    statusFilter,
    setStatusFilter,
    divisionFilter,
    setDivisionFilter,
    totalCount: filteredEmployees.length,
  };
}
