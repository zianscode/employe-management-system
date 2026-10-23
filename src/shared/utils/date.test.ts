import { describe, expect, it } from "vitest";
import { countWorkingDays, dateKeyToDate, formatTime, toDateKey, zonedDateTime } from "./date";

describe("countWorkingDays", () => {
  const monday = dateKeyToDate("2026-10-19");
  const sunday = dateKeyToDate("2026-10-25");

  it("tidak menghitung akhir pekan", () => {
    expect(countWorkingDays(monday, sunday)).toBe(5);
  });

  it("tidak menghitung hari libur", () => {
    expect(countWorkingDays(monday, sunday, new Set(["2026-10-21"]))).toBe(4);
  });

  it("mengembalikan 0 untuk rentang yang hanya akhir pekan", () => {
    expect(countWorkingDays(dateKeyToDate("2026-10-24"), sunday)).toBe(0);
  });
});

describe("zona waktu Asia/Jakarta", () => {
  it("menentukan tanggal hari ini berdasarkan WIB", () => {
    expect(toDateKey(new Date("2026-10-21T18:00:00Z"))).toBe("2026-10-22");
  });

  it("membuat waktu WIB yang konsisten saat diformat ulang", () => {
    const value = zonedDateTime("2026-10-21", "08:30");
    expect(value.toISOString()).toBe("2026-10-21T01:30:00.000Z");
    expect(formatTime(value)).toBe("08:30");
  });
});
