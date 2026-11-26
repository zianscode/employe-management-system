"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AttendanceControls from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { ClockInCard } from "./ClockInCard";
import { CorrectionPanel } from "./CorrectionPanel";
import { useAttendance } from "@/features/attendance/hooks/use-attendance";
import { toDateKey } from "@/shared/utils/date";
import { downloadCSV } from "@/lib/api/download";
import { Card } from "@/shared/components/ui/card";
import AttendanceHeader from "./AttendanceHeader";
import AttendanceStats, { StatData } from "./AttendanceStats";
import { UpcomingHolidaysCard } from "./UpcomingHolidaysCard";
import { HolidayRow } from "@/shared/types/settings.types";

export function AttendanceClient({ stats, holidays }: { stats: StatData[]; holidays: HolidayRow[] }) {
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

  const handleChange = () => {
    refresh();
    router.refresh();
  };

  return (
    <>
      <AttendanceHeader onDownload={() => downloadCSV("/attendance/daily.csv", { date: selectedDate, q: searchQuery, status: statusFilter })} />
      <ClockInCard onChange={handleChange} />
      <AttendanceStats stats={stats} />

      <Card>
        <AttendanceControls
          searchQuery={searchQuery}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onDateChange={setSelectedDate}
          onStatusChange={setStatusFilter}
        />
        <AttendanceTable data={data} isLoading={isLoading} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div id="koreksi" className="scroll-mt-6 lg:col-span-2">
          <CorrectionPanel onChange={handleChange} />
        </div>
        <UpcomingHolidaysCard holidays={holidays} />
      </div>
    </>
  );
}
