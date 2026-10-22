"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Filter from "@/features/reports/components/Filter";
import { AttendanceReport } from "@/features/reports/components/AttendanceReport";
import { SalaryReport } from "@/features/reports/components/SalaryReport";
import { EmployeeReport } from "@/features/reports/components/EmployeeReport";
import { LeaveReport } from "@/features/reports/components/LeaveReport";
import { useReports } from "@/features/reports/hooks/use-reports";
import { ReportTabId } from "@/shared/types/report.types";
import { isAdminRole } from "@/shared/constants/roles";
import { Page, PageHeader } from "@/shared/components/ui/Page";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Spinner } from "@/shared/components/ui/Feedback";

const TABS: { id: ReportTabId; label: string; adminOnly: boolean }[] = [
  { id: "absensi", label: "Absensi", adminOnly: false },
  { id: "gaji", label: "Gaji", adminOnly: true },
  { id: "karyawan", label: "Karyawan", adminOnly: false },
  { id: "cuti", label: "Cuti", adminOnly: false },
];

export default function ReportsPage() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const { activeTab, setActiveTab, selectedMonth, setSelectedMonth, report, isLoading, periodLabel, fileSuffix } = useReports();

  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);
  const reportProps = { periodLabel, fileSuffix };

  return (
    <Page>
      <PageHeader
        title="Laporan"
        description={isAdmin ? "Rekap bulanan seluruh perusahaan" : "Rekap bulanan tim Anda"}
        actions={<Filter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />}
      />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && report?.tab === "absensi" && <AttendanceReport data={report.data} {...reportProps} />}
      {!isLoading && report?.tab === "gaji" && <SalaryReport data={report.data} {...reportProps} />}
      {!isLoading && report?.tab === "karyawan" && <EmployeeReport data={report.data} {...reportProps} />}
      {!isLoading && report?.tab === "cuti" && <LeaveReport data={report.data} {...reportProps} />}
    </Page>
  );
}
