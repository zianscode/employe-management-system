export const APP_TIMEZONE = "Asia/Jakarta";

export function toDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dateToDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function minutesOfDay(date: Date = new Date()): number {
  const [h, m] = formatTime(date).split(":").map(Number);
  return h * 60 + m;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (!isWeekend(cursor)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export function monthRange(month: number, year: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 0)),
  };
}
