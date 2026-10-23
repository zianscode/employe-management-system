"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { MyTodayAttendance } from "@/shared/types/attendance.types";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  clockInAction,
  clockOutAction,
  getMyTodayAttendanceAction,
} from "@/server/modules/attendance/attendance.actions";

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

  const load = useCallback(async () => {
    const res = await getMyTodayAttendanceAction();
    setToday(res.success && res.data ? res.data : null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!today) return null;

  const handle = async (action: typeof clockInAction) => {
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
            <p className="text-sm font-medium text-gray-900">Absensi saya hari ini</p>
            <StatusBadge status={today.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {today.date} · jam kerja {today.workStartTime}–{today.workEndTime}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="text-gray-500">Masuk</dt>
              <dd className="font-medium tabular-nums text-gray-900">{today.checkIn ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Pulang</dt>
              <dd className="font-medium tabular-nums text-gray-900">{today.checkOut ?? "-"}</dd>
            </div>
          </dl>
          {canClockIn && (
            <Button onClick={() => handle(clockInAction)} loading={isSubmitting}>
              <LogIn className="h-4 w-4" />
              Check-in
            </Button>
          )}
          {canClockOut && (
            <Button variant="secondary" onClick={() => handle(clockOutAction)} loading={isSubmitting}>
              <LogOut className="h-4 w-4" />
              Check-out
            </Button>
          )}
        </div>
      </div>
      <ul className="space-y-1 border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-600">
        <li>
          Check-in setelah <span className="font-medium text-gray-900">{lateAfter}</span> tercatat terlambat
          {today.lateToleranceMinutes > 0 && ` (toleransi ${today.lateToleranceMinutes} menit)`}.
        </li>
        <li>
          Check-out sebelum <span className="font-medium text-gray-900">{today.workEndTime}</span> tercatat pulang cepat, setelahnya
          dihitung lembur.
        </li>
        <li>
          Lupa check-in atau check-out?{" "}
          <Link href="/dashboard/attendance#koreksi" className="font-medium text-brand hover:underline">
            Ajukan koreksi absensi
          </Link>{" "}
          paling lambat 30 hari setelahnya.
        </li>
      </ul>
    </Card>
  );
}
