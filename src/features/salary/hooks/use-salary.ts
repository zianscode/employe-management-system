import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { SalaryRecord } from "@/shared/types/salary.types";
import { getSalariesAction } from "@/server/modules/salary/salary.actions";
import { toDateKey } from "@/shared/utils/date";

export function useSalary() {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  /** "YYYY-MM" */
  const [selectedMonth, setSelectedMonth] = useState(() => toDateKey().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const [year, month] = selectedMonth.split("-").map(Number);
    const res = await getSalariesAction(month, year);
    if (res.success && res.data) setSalaryData(res.data);
    else toast.error(res.message);
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return salaryData.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(q) || emp.nip.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Semua Status" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salaryData, searchQuery, statusFilter]);

  const stats = useMemo(
    () => ({
      totalSalary: salaryData.reduce((sum, emp) => sum + emp.totalSalary, 0),
      basicSalary: salaryData.reduce((sum, emp) => sum + emp.basicSalary, 0),
      totalAllowance: salaryData.reduce((sum, emp) => sum + emp.allowance + emp.overtimePay, 0),
      totalDeduction: salaryData.reduce((sum, emp) => sum + emp.deduction, 0),
    }),
    [salaryData]
  );

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
    refresh,
  };
}
