/**
 * Konvensi tanggal di aplikasi:
 * - "Hari ini", jam masuk/pulang, dan tampilan jam memakai zona waktu perusahaan (APP_TIMEZONE),
 *   tidak bergantung pada zona waktu server.
 * - Nilai yang hanya berupa tanggal (Attendance.date, LeaveRequest.startDate/endDate)
 *   disimpan sebagai tengah malam UTC dari tanggal tersebut.
 */
export const APP_TIMEZONE = "Asia/Jakarta";

/** "YYYY-MM-DD" dari sebuah waktu, menurut zona waktu perusahaan */
export function toDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** "YYYY-MM-DD" -> Date tengah malam UTC (untuk kolom tanggal) */
export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Date tengah malam UTC -> "YYYY-MM-DD" */
export function dateToDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Tanggal (tengah malam UTC) -> "dd/mm/yyyy" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Waktu -> "HH:mm" menurut zona waktu perusahaan */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** Menit sejak tengah malam menurut zona waktu perusahaan */
export function minutesOfDay(date: Date = new Date()): number {
  const [h, m] = formatTime(date).split(":").map(Number);
  return h * 60 + m;
}

/** "HH:mm" -> menit sejak tengah malam */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/** Jumlah hari kerja (Senin-Jumat) dari start s/d end, inklusif. Input: tanggal tengah malam UTC. */
export function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (!isWeekend(cursor)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

/** Batas awal & akhir bulan (tanggal tengah malam UTC). month: 1-12 */
export function monthRange(month: number, year: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 0)),
  };
}
