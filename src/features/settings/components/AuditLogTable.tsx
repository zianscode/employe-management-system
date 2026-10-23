"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Card, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Form";
import { Badge } from "@/shared/components/ui/Badge";
import { Alert } from "@/shared/components/ui/Feedback";
import { AuditLogRow } from "@/shared/types/audit.types";
import { getAuditLogsAction } from "@/server/modules/audit/audit.actions";

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAuditLogsAction().then((res) => {
      if (res.success && res.data) setLogs(res.data);
      else setError(res.message);
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      [log.actorName, log.actionLabel, log.targetName, log.detail].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [logs, search]);

  return (
    <Card>
      <CardHeader
        title="Riwayat aktivitas"
        description="100 perubahan terakhir oleh HR, admin, dan atasan"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama atau aktivitas"
              className="h-8 w-56 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />
      {error ? (
        <div className="p-5">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : (
        <DataTable
          data={filtered}
          isLoading={isLoading}
          emptyMessage="Belum ada aktivitas yang tercatat"
          columns={[
            { header: "Waktu", accessor: "at", className: "tabular-nums text-gray-500" },
            {
              header: "Aktivitas",
              className: "whitespace-normal",
              accessor: (log: AuditLogRow) => (
                <div className="max-w-xl">
                  <p className="text-gray-900">
                    <span className="font-medium">{log.actorName}</span> {log.actionLabel}
                    {log.targetName && <span className="font-medium"> {log.targetName}</span>}
                  </p>
                  {log.detail && <p className="mt-0.5 text-xs text-gray-500">{log.detail}</p>}
                </div>
              ),
            },
            { header: "Bagian", accessor: (log: AuditLogRow) => <Badge>{log.area}</Badge> },
          ]}
        />
      )}
    </Card>
  );
}
