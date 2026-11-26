export interface AttendanceSummary {
  periodLabel: string;
  present: number;
  late: number;
  earlyLeave: number;
  lateMinutes: number;
  overtimeHours: number;
  leaveDays: number;
}

export interface LeaveHistoryItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
  nextStep: string | null;
}

export interface SalaryHistoryItem {
  id: string;
  periodLabel: string;
  totalNet: number;
  isPaid: boolean;
}

export interface EmployeeHistory {
  attendance: AttendanceSummary;
  leaves: LeaveHistoryItem[];
  salaries: SalaryHistoryItem[];
}

export interface MyOverview {
  latestLeave: LeaveHistoryItem | null;
  latestSalary: SalaryHistoryItem | null;
}
