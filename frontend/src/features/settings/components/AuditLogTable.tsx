"use client";

import React, { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Alert } from "@/shared/components/ui/alert";
import { AuditLogRow } from "@/shared/types/audit.types";
import { getAuditLogs } from "@/lib/api/client";

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAuditLogs().then((res) => {
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
      <CardHeading
        title="Riwayat aktivitas"
        description="100 perubahan terakhir oleh HR, admin, dan atasan"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Cari nama atau aktivitas"
              className="w-56 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />
      {error ? (
        <div className="p-5">
          <Alert variant="destructive">{error}</Alert>
        </div>
      ) : (
        <DataTable
          data={filtered}
          isLoading={isLoading}
          emptyIcon={History}
          emptyMessage="Belum ada aktivitas yang tercatat"
          emptyDescription="Perubahan data karyawan, gaji, dan persetujuan akan muncul di sini."
          columns={[
            {
              header: "Aktivitas",
              className: "whitespace-normal",
              accessor: (log: AuditLogRow) => (
                <div className="max-w-xl">
                  <p className="text-foreground">
                    <span className="font-medium">{log.actorName}</span> {log.actionLabel}
                    {log.targetName && <span className="font-medium"> {log.targetName}</span>}
                  </p>
                  {log.detail && <p className="mt-0.5 text-xs text-muted-foreground">{log.detail}</p>}
                </div>
              ),
            },
            { header: "Waktu", accessor: "at", className: "tabular-nums text-muted-foreground" },
            { header: "Bagian", accessor: (log: AuditLogRow) => <Badge variant="secondary">{log.area}</Badge> },
          ]}
        />
      )}
    </Card>
  );
}
