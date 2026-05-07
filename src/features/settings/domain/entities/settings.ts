export interface SystemSettings {
  autoBackup: boolean;
  dataRetention: boolean;
  twoFactor: boolean;
  forcePasswordChange: boolean;
  apiRateLimit: boolean;
  newEmployee: boolean;
  leaveRequest: boolean;
  monthlyReport: boolean;
  backupComplete: boolean;
}

export type SettingsTabId = "general" | "company" | "users" | "security" | "notifications";
