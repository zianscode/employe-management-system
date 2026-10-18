import React from "react";
import { SettingsClient } from "@/features/settings/components/SettingsClient";
import { getUsersAction } from "@/server/modules/settings/user.actions";

export default async function SettingsPage() {
  // Pemicu Server Side Loading (agar Skeleton Muncul)
  await getUsersAction();

  return (
    <div className="py-4 pl-8 pr-6">
      <SettingsClient />
    </div>
  );
}
