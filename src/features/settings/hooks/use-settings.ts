"use client";

import { useState, useEffect } from "react";
import { SystemSettings, SettingsTabId, SystemUser } from "@/shared/types/settings.types";
import { getUsersAction } from "@/server/modules/settings/user.actions";

export function useSettings(isAdmin: boolean) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(isAdmin ? "general" : "session");
  const [users, setUsers] = useState<SystemUser[]>([]);
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

  const fetchUsers = async () => {
    const res = await getUsersAction();
    if (res.success && res.data) {
      setUsers(res.data);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

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
    users,
    handleToggle,
    refreshUsers: fetchUsers,
  };
}
