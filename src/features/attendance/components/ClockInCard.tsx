"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { MyTodayAttendance } from "@/shared/types/attendance.types";
import {
  clockInAction,
  clockOutAction,
  getMyTodayAttendanceAction,
} from "@/server/modules/attendance/attendance.actions";

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[#E02F75]/10 text-[#E02F75]">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Absensi Anda hari ini · {today.date} · Jam kerja {today.workStartTime}–{today.workEndTime}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={today.status} />
            <span className="text-sm text-gray-700">
              Masuk <b>{today.checkIn ?? "-"}</b> · Pulang <b>{today.checkOut ?? "-"}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {canClockIn && (
          <button
            onClick={() => handle(clockInAction)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
          >
            <LogIn size={16} />
            Check-in
          </button>
        )}
        {canClockOut && (
          <button
            onClick={() => handle(clockOutAction)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E02F75] text-[#E02F75] rounded-xl font-bold text-sm disabled:opacity-50"
          >
            <LogOut size={16} />
            Check-out
          </button>
        )}
      </div>
    </div>
  );
}
