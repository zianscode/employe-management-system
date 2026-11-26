"use client";

import { useState, useEffect } from "react";
import { SettingsTabId, SystemUser } from "@/shared/types/settings.types";
import { getUsers } from "@/lib/api/client";

export function useSettings(isAdmin: boolean) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(isAdmin ? "company" : "session");
  const [users, setUsers] = useState<SystemUser[]>([]);

  const fetchUsers = async () => {
    const res = await getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  return {
    activeTab,
    setActiveTab,
    users,
    refreshUsers: fetchUsers,
  };
}
