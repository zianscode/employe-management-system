import React from "react";
import { Page } from "@/shared/components/ui/Page";
import { Skeleton } from "@/shared/components/ui/Feedback";

export default function ProfileLoading() {
  return (
    <Page>
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-72 rounded-lg" />
    </Page>
  );
}
