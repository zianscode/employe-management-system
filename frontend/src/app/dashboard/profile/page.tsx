import React from "react";
import { ProfileClient } from "@/features/profile/components/ProfileClient";
import { Page } from "@/shared/components/PageLayout";

export default function ProfilePage() {
  return (
    <Page>
      <ProfileClient />
    </Page>
  );
}
