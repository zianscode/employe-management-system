"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/shared/components/ui/Page";

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

const DashboardHeader = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const today = new Date();
  const dateLabel = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(today));

  return <PageHeader title={`${greeting(hour)}${firstName ? `, ${firstName}` : ""}`} description={dateLabel} />;
};

export default DashboardHeader;
