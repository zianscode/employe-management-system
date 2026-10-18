import { useState, useMemo, useEffect } from "react";
import { SalaryRecord } from "@/shared/types/salary.types";
import { getSalaries } from "@/server/modules/salary/salary.actions";

export function useSalary() {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("January 2024");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getSalaries();
      setSalaryData(data as SalaryRecord[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return salaryData.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "Semua Status" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salaryData, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      totalSalary: salaryData.reduce((sum, emp) => sum + emp.totalSalary, 0),
      basicSalary: salaryData.reduce((sum, emp) => sum + emp.basicSalary, 0),
      totalAllowance: salaryData.reduce((sum, emp) => sum + emp.allowance, 0),
      totalDeduction: salaryData.reduce((sum, emp) => sum + emp.deduction, 0),
    };
  }, [salaryData]);

  return {
    data: filteredData,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    totalCount: salaryData.length,
    filteredCount: filteredData.length,
    refresh: async () => {
      const data = await getSalaries();
      setSalaryData(data as SalaryRecord[]);
    }
  };
}
