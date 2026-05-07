"use client";

import React from "react";
import AttendanceHeader from "@/features/attendance/presentation/components/AttendanceHeader";
import AttendanceStats from "@/features/attendance/presentation/components/AttendanceStats";
import AttendanceControls from "../../../features/attendance/presentation/components/AttendanceControls";
import { AttendanceTable } from "@/features/attendance/presentation/components/AttendanceTable";
import { useAttendance } from "@/features/attendance/presentation/hooks/use-attendance";

export default function AttendancePage() {
  const {
    data,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
  } = useAttendance("2024-01-15");

  return (
    <div className="py-4 pl-8 pr-6 space-y-4">
      <AttendanceHeader />

      <AttendanceStats />

      <AttendanceControls
        searchQuery={searchQuery}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onDateChange={setSelectedDate}
        onStatusChange={setStatusFilter}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <AttendanceTable
          data={data}
          isLoading={isLoading}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
