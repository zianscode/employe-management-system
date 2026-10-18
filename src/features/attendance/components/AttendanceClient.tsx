"use client";

import React from "react";
import AttendanceControls from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { useAttendance } from "@/features/attendance/hooks/use-attendance";

export function AttendanceClient() {
  const {
    data,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
  } = useAttendance(new Date().toISOString().split('T')[0]);

  return (
    <>
      <AttendanceControls
        searchQuery={searchQuery}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onDateChange={setSelectedDate}
        onStatusChange={setStatusFilter}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
        <AttendanceTable
          data={data}
          isLoading={isLoading}
          selectedDate={selectedDate}
        />
      </div>
    </>
  );
}
