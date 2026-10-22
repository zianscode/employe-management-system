import React from "react";
import { OrganizationClient } from "@/features/organization/components/OrganizationClient";
import { Page } from "@/shared/components/ui/Page";
import { getOrganizationAction } from "@/server/modules/organization/organization.actions";

export default async function OrganizationPage() {
  const res = await getOrganizationAction();
  const { departments, positions } = res.success && res.data ? res.data : { departments: [], positions: [] };

  return (
    <Page>
      <OrganizationClient departments={departments} positions={positions} />
    </Page>
  );
}
