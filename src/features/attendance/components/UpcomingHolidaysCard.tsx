import React from "react";
import { HolidayRow } from "@/shared/types/settings.types";
import { Card, CardHeader } from "@/shared/components/ui/Card";

function dayName(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("id-ID", { weekday: "long", timeZone: "UTC" });
}

export function UpcomingHolidaysCard({ holidays }: { holidays: HolidayRow[] }) {
  return (
    <Card>
      <CardHeader title="Hari libur mendatang" description="Tidak dihitung sebagai hari kerja" />
      {holidays.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-500">Belum ada hari libur yang dijadwalkan.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="text-gray-900">{holiday.name}</span>
              <span className="shrink-0 text-gray-500">
                {dayName(holiday.dateKey)}, {holiday.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
