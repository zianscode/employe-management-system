export type SettingsTabId = "company" | "holidays" | "users" | "security" | "session";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface CompanySetting {
  id: string;
  companyName: string;
  companyCode: string | null;
  npwp: string | null;
  phone: string | null;
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
  overtimeRatePerHour: number;
  workingDaysPerMonth: number;
  annualLeaveQuota: number;
  bpjsKesehatanWageCap: number;
  jpWageCap: number;
  jkkRateBps: number;
  bpjsMinimumWage: number;
}

export interface HolidayRow {
  id: string;
  dateKey: string;
  date: string;
  name: string;
}
