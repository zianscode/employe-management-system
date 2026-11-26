import type { MyOverview } from "@/shared/types/history.types";
import type { AttendanceReportData, EmployeeReportData, LeaveReportData, SalaryReportData } from "@/shared/types/report.types";
import type { PayrollComponentRow, SalaryRecord, SalarySlip } from "@/shared/types/salary.types";
import { request, type Transport } from "./transport";
import type { components } from "./schema";

export function payrollReportsAPI(transport: Transport) {
  const rest = <T>(path: string, method = "GET", body?: unknown) => request<T>(transport, path, method, body);
  const query = (month: number, year: number) => `?month=${month}&year=${year}`;
  const id = encodeURIComponent;
  const payroll = (month: number, year: number) => `/payroll-periods/${year}/${month}`;
  const employeeComponents = (employeeId: string) => `/employees/${id(employeeId)}/payroll-components`;

  return {
    getSalaries: (month: number, year: number) => rest<SalaryRecord[]>(`/salaries${query(month, year)}`),
    getSalarySlip: (salaryId: string) => rest<SalarySlip>(`/salaries/${id(salaryId)}/slip`),
    generatePayroll: (month: number, year: number) =>
      rest<{ processed: number; skippedPaid: number }>(`${payroll(month, year)}/generate`, "POST"),
    markPeriodPaid: (month: number, year: number) => rest<{ count: number }>(`${payroll(month, year)}/mark-paid`, "POST"),
    markSalaryPaid: (salaryId: string) => rest(`/salaries/${id(salaryId)}/mark-paid`, "POST"),
    getPayrollComponents: (employeeId: string) => rest<PayrollComponentRow[]>(employeeComponents(employeeId)),
    addPayrollComponent: (employeeId: string, input: Omit<PayrollComponentRow, "id">) =>
      rest(employeeComponents(employeeId), "POST", input),
    deletePayrollComponent: (componentId: string) => rest(`/payroll-components/${id(componentId)}`, "DELETE"),
    getDashboardStats: () => rest<components["schemas"]["DashboardStats"]>("/dashboard/stats"),
    getMyOverview: () => rest<MyOverview | null>("/dashboard/me"),
    getSalaryTrend: () => rest<{ month: string; total: number }[]>("/reports/salary-trend"),
    getDeptDistribution: () => rest<{ name: string; count: number }[]>("/reports/department-distribution"),
    getAttendanceReport: (month: number, year: number) => rest<AttendanceReportData>(`/reports/attendance${query(month, year)}`),
    getSalaryReport: (month: number, year: number) => rest<SalaryReportData>(`/reports/salary${query(month, year)}`),
    getEmployeeReport: (month: number, year: number) => rest<EmployeeReportData>(`/reports/employees${query(month, year)}`),
    getLeaveReport: (month: number, year: number) => rest<LeaveReportData>(`/reports/leave${query(month, year)}`),
  };
}
