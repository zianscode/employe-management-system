import React from "react";
import { Page } from "@/shared/components/ui/Page";
import { Skeleton } from "@/shared/components/ui/Feedback";

export default function LeaveLoading() {
  return (
    <Page>
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </Page>
  );
}
