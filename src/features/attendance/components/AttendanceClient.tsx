"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AttendanceControls from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { ClockInCard } from "./ClockInCard";
import { useAttendance } from "@/features/attendance/hooks/use-attendance";
import { toDateKey } from "@/shared/utils/date";

export function AttendanceClient() {
  const router = useRouter();
  const {
    data,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useAttendance(toDateKey());

  return (
    <>
      <ClockInCard
        onChange={() => {
          refresh();
          router.refresh();
        }}
      />

      <AttendanceControls
        searchQuery={searchQuery}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onDateChange={setSelectedDate}
        onStatusChange={setStatusFilter}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
        <AttendanceTable data={data} isLoading={isLoading} selectedDate={selectedDate} />
      </div>
    </>
  );
}
