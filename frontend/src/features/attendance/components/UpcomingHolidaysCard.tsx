import React from "react";
import { HolidayRow } from "@/shared/types/settings.types";
import { Card } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";

function dayName(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("id-ID", { weekday: "long", timeZone: "UTC" });
}

export function UpcomingHolidaysCard({ holidays }: { holidays: HolidayRow[] }) {
  return (
    <Card>
      <CardHeading title="Hari libur mendatang" description="Tidak dihitung sebagai hari kerja" />
      {holidays.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">Belum ada hari libur yang dijadwalkan.</p>
      ) : (
        <ul className="divide-y divide-border">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="text-foreground">{holiday.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {dayName(holiday.dateKey)}, {holiday.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
