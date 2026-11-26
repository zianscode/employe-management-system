"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { MyTodayAttendance } from "@/shared/types/attendance.types";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  clockIn,
  clockOut,
  getMyTodayAttendance,
} from "@/lib/api/client";

const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function useLiveClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(clockFormatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface ClockInCardProps {
  onChange?: () => void;
}

export function ClockInCard({ onChange }: ClockInCardProps) {
  const [today, setToday] = useState<MyTodayAttendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const now = useLiveClock();

  const load = useCallback(async () => {
    const res = await getMyTodayAttendance();
    setToday(res.success && res.data ? res.data : null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!today) return null;

  const handle = async (action: typeof clockIn) => {
    setIsSubmitting(true);
    const res = await action();
    if (res.success) {
      toast.success(res.message);
      await load();
      onChange?.();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const canClockIn = !today.checkIn && !today.onLeave;
  const canClockOut = !!today.checkIn && !today.checkOut;

  const lateAfter = addMinutes(today.workStartTime, today.lateToleranceMinutes);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Absensi saya hari ini</p>
            <StatusBadge status={today.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {today.date} · jam kerja {today.workStartTime}–{today.workEndTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Sekarang</dt>
              <dd className="font-medium tabular-nums text-foreground">{now ?? "--:--:--"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Masuk</dt>
              <dd className="font-medium tabular-nums text-foreground">{today.checkIn ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pulang</dt>
              <dd className="font-medium tabular-nums text-foreground">{today.checkOut ?? "-"}</dd>
            </div>
          </dl>
          {canClockIn && (
            <Button onClick={() => handle(clockIn)} loading={isSubmitting} className="w-full sm:w-auto">
              <LogIn className="h-4 w-4" />
              Check-in
            </Button>
          )}
          {canClockOut && (
            <Button variant="outline" onClick={() => handle(clockOut)} loading={isSubmitting} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4" />
              Check-out
            </Button>
          )}
        </div>
      </div>
      <ul className="space-y-1 border-t border-border bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
        <li>
          Check-in setelah <span className="font-medium text-foreground">{lateAfter}</span> tercatat terlambat
          {today.lateToleranceMinutes > 0 && ` (toleransi ${today.lateToleranceMinutes} menit)`}.
        </li>
        <li>
          Check-out sebelum <span className="font-medium text-foreground">{today.workEndTime}</span> tercatat pulang cepat, setelahnya
          dihitung lembur.
        </li>
        <li>
          Lupa check-in atau check-out?{" "}
          <Link href="/dashboard/attendance#koreksi" className="font-medium text-primary hover:underline">
            Ajukan koreksi absensi
          </Link>{" "}
          paling lambat 30 hari setelahnya.
        </li>
      </ul>
    </Card>
  );
}
