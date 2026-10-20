import React from "react";
import { OrganizationClient } from "@/features/organization/components/OrganizationClient";
import { getOrganizationAction } from "@/server/modules/organization/organization.actions";

export default async function OrganizationPage() {
  const res = await getOrganizationAction();
  const { departments, positions } = res.success && res.data ? res.data : { departments: [], positions: [] };

  return (
    <div className="py-4 pl-8 pr-6">
      <OrganizationClient departments={departments} positions={positions} />
    </div>
  );
}
