"use client";

import React, { useState } from "react";
import { Calculator, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSalary } from "@/features/salary/hooks/use-salary";
import { SalaryStats } from "@/features/salary/components/SalaryStats";
import { DataTable } from "@/shared/components/DataTable";
import { SalaryRecord } from "@/shared/types/salary.types";
import { isAdminRole } from "@/shared/constants/roles";
import { formatCurrency } from "@/shared/utils/format";
import { generatePayrollAction, markSalaryPaidAction } from "@/server/modules/salary/salary.actions";
import { Page, PageHeader } from "@/shared/components/ui/Page";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Input, Select } from "@/shared/components/ui/Form";
import { Badge } from "@/shared/components/ui/Badge";

type SalaryColumn = {
  header: string;
  accessor: keyof SalaryRecord | ((item: SalaryRecord) => React.ReactNode);
  className?: string;
};

const money = (value: number) => <span className="tabular-nums">{formatCurrency(value)}</span>;

export default function SalaryPage() {
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    totalCount,
    filteredCount,
    refresh,
  } = useSalary();

  const [year, month] = selectedMonth.split("-").map(Number);
  const periodLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const run = async (action: () => Promise<{ success: boolean; message: string }>) => {
    setIsProcessing(true);
    const res = await action();
    if (res.success) {
      toast.success(res.message);
      await refresh();
    } else {
      toast.error(res.message);
    }
    setIsProcessing(false);
  };

  const columns: SalaryColumn[] = [
    {
      header: "Karyawan",
      accessor: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.position}</p>
        </div>
      ),
    },
    { header: "Gaji pokok", accessor: (item) => money(item.basicSalary), className: "text-right" },
    { header: "Tunjangan", accessor: (item) => money(item.allowance), className: "text-right" },
    { header: "Lembur", accessor: (item) => money(item.overtimePay), className: "text-right" },
    { header: "BPJS", accessor: (item) => money(item.bpjsEmployee), className: "text-right" },
    { header: "PPh 21", accessor: (item) => money(item.pph21), className: "text-right" },
    { header: "Potongan lain", accessor: (item) => money(item.deduction), className: "text-right" },
    {
      header: "Diterima",
      accessor: (item) => <span className="font-medium text-gray-900">{money(item.totalSalary)}</span>,
      className: "text-right",
    },
    {
      header: "Status",
      accessor: (item) =>
        item.status === "Dibayar" ? <Badge tone="green">Dibayar</Badge> : <Badge tone="yellow">Belum dibayar</Badge>,
    },
    {
      header: "",
      className: "text-right",
      accessor: (item) => (
        <div className="flex items-center justify-end gap-2">
          {isAdmin && item.status === "Pending" && (
            <Button size="sm" variant="secondary" onClick={() => run(() => markSalaryPaidAction(item.id))} disabled={isProcessing}>
              Tandai dibayar
            </Button>
          )}
          <Link href={`/dashboard/salary/${item.id}/slip`} className="text-sm font-medium text-brand hover:underline">
            Slip
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title={isAdmin ? "Penggajian" : "Gaji saya"}
        description={isAdmin ? `Perhitungan gaji periode ${periodLabel}` : "Riwayat gaji per periode"}
        actions={
          isAdmin && (
            <Button onClick={() => run(() => generatePayrollAction(month, year))} loading={isProcessing}>
              {!isProcessing && <Calculator className="h-4 w-4" />}
              Hitung gaji {periodLabel}
            </Button>
          )
        }
      />

      <SalaryStats stats={stats} />

      <Card>
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama atau NIP"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:max-w-xs"
            />
          </div>
          <div className="flex gap-3">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="sm:w-44"
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
              <option value="Semua Status">Semua status</option>
              <option value="Dibayar">Dibayar</option>
              <option value="Pending">Belum dibayar</option>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          emptyMessage={isAdmin ? `Belum ada data gaji ${periodLabel}. Klik "Hitung gaji" untuk membuatnya.` : "Belum ada data gaji"}
        />

        <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
          {filteredCount} dari {totalCount} data
        </div>
      </Card>
    </Page>
  );
}
