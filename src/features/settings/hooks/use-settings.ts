"use client";

import { useState, useEffect } from "react";
import { SystemSettings, SettingsTabId } from "@/shared/types/settings.types";
import { getUsersAction } from "@/server/modules/settings/user.actions";

interface SystemUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
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
    if (res.success) {
      setUsers(res.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
