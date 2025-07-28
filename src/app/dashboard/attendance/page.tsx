"use client";

import React, { useState } from "react";
import Header from "@/components/ui/attendance/Header";
import StatsCards from "@/components/ui/attendance/StatsCard";
import Controls from "@/components/ui/attendance/Controls";
import DataTable from "@/components/ui/attendance/DataTable";

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      {/* Header */}
      <Header />

      <div className="py-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Controls */}
        <Controls
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onDateChange={setSelectedDate}
          onStatusChange={setStatusFilter}
        />

        {/* Data Table */}
        <DataTable
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
}
