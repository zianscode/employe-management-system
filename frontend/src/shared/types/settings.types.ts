export type SettingsTabId = "company" | "holidays" | "users" | "security" | "activity" | "session";

export type AccountState = "ACTIVE" | "INACTIVE" | "LOCKED" | "MUST_CHANGE_PASSWORD";

export interface AccountInfo {
  userId: string;
  state: AccountState;
  lockedUntil: string | null;
}

export interface SystemUser extends AccountInfo {
  name: string;
  email: string;
  role: string;
  employeeId: string | null;
  isSelf: boolean;
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
