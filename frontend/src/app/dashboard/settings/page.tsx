import React from "react";
import { SettingsClient } from "@/features/settings/components/SettingsClient";
import { Page } from "@/shared/components/PageLayout";

export default function SettingsPage() {
  return (
    <Page>
      <SettingsClient />
    </Page>
  );
}
