import React from "react";
import { OrganizationClient } from "@/features/organization/components/OrganizationClient";
import { Page } from "@/shared/components/PageLayout";
import { getOrganization } from "@/lib/api/server";

export default async function OrganizationPage() {
  const res = await getOrganization();
  const { departments, positions } = res.success && res.data ? res.data : { departments: [], positions: [] };

  return (
    <Page>
      <OrganizationClient departments={departments} positions={positions} />
    </Page>
  );
}
