"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AttendanceControls from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { ClockInCard } from "./ClockInCard";
import { CorrectionPanel } from "./CorrectionPanel";
import { useAttendance } from "@/features/attendance/hooks/use-attendance";
import { toDateKey } from "@/shared/utils/date";
import { downloadCsv, CsvColumn } from "@/shared/utils/csv";
import { Attendance } from "@/shared/types/attendance.types";
import { ATTENDANCE_STATUS_LABELS } from "@/shared/constants/attendance";
import { Card } from "@/shared/components/ui/Card";
import AttendanceHeader from "./AttendanceHeader";
import AttendanceStats, { StatData } from "./AttendanceStats";

const CSV_COLUMNS: CsvColumn<Attendance>[] = [
  { header: "NIP", value: (r) => r.nip },
  { header: "Nama", value: (r) => r.nama },
  { header: "Tanggal", value: (r) => r.tanggal },
  { header: "Jam Masuk", value: (r) => r.jamMasuk },
  { header: "Jam Keluar", value: (r) => r.jamKeluar },
  { header: "Jam Kerja", value: (r) => r.jamKerja },
  { header: "Status", value: (r) => ATTENDANCE_STATUS_LABELS[r.status] ?? r.status },
  { header: "Keterangan", value: (r) => r.keterangan },
];

export function AttendanceClient({ stats }: { stats: StatData[] }) {
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
      <AttendanceHeader onDownload={() => downloadCsv(`absensi-${selectedDate}`, data, CSV_COLUMNS)} />
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

      <CorrectionPanel onChange={handleChange} />
    </>
  );
}
