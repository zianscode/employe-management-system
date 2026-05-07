import { useState } from "react";
import { SystemSettings, SettingsTabId } from "../../domain/entities/settings";

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [settings, setSettings] = useState<SystemSettings>({
    autoBackup: true,
    dataRetention: true,
    twoFactor: false,
    forcePasswordChange: true,
    apiRateLimit: true,
    newEmployee: true,
    leaveRequest: true,
    monthlyReport: false,
    backupComplete: true,
  });

  const handleToggle = (setting: keyof SystemSettings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    handleToggle,
  };
}
