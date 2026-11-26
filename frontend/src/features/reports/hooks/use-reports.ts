import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AttendanceReportData,
  EmployeeReportData,
  LeaveReportData,
  ReportTabId,
  SalaryReportData,
} from "@/shared/types/report.types";
import {
  getAttendanceReport,
  getEmployeeReport,
  getLeaveReport,
  getSalaryReport,
} from "@/lib/api/client";
import { toDateKey } from "@/shared/utils/date";

export type ReportData =
  | { tab: "absensi"; data: AttendanceReportData }
  | { tab: "gaji"; data: SalaryReportData }
  | { tab: "karyawan"; data: EmployeeReportData }
  | { tab: "cuti"; data: LeaveReportData };

async function fetchReport(tab: ReportTabId, month: number, year: number): Promise<ReportData | string> {
  switch (tab) {
    case "absensi": {
      const res = await getAttendanceReport(month, year);
      return res.success && res.data ? { tab, data: res.data } : res.message;
    }
    case "gaji": {
      const res = await getSalaryReport(month, year);
      return res.success && res.data ? { tab, data: res.data } : res.message;
    }
    case "karyawan": {
      const res = await getEmployeeReport(month, year);
      return res.success && res.data ? { tab, data: res.data } : res.message;
    }
    case "cuti": {
      const res = await getLeaveReport(month, year);
      return res.success && res.data ? { tab, data: res.data } : res.message;
    }
  }
}

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTabId>("absensi");
  const [selectedMonth, setSelectedMonth] = useState(() => toDateKey().slice(0, 7));
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [year, month] = selectedMonth.split("-").map(Number);

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchReport(activeTab, month, year);
    if (typeof result === "string") {
      toast.error(result);
      setReport(null);
    } else {
      setReport(result);
    }
    setIsLoading(false);
  }, [activeTab, month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const periodLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    report: report?.tab === activeTab ? report : null,
    isLoading,
    periodLabel,
    fileSuffix: selectedMonth,
  };
}
