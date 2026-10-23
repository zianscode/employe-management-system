import { describe, expect, it } from "vitest";
import { evaluateAttendance } from "./attendance.rules";
import { zonedDateTime } from "@/shared/utils/date";

const schedule = { workStartTime: "08:00", workEndTime: "17:00", lateToleranceMinutes: 15 };
const at = (time: string) => zonedDateTime("2026-10-21", time);

describe("evaluateAttendance", () => {
  it("tidak terlambat selama masih dalam toleransi", () => {
    const result = evaluateAttendance({ checkIn: at("08:15") }, schedule);
    expect(result.status).toBe("PRESENT");
    expect(result.lateInMinutes).toBe(0);
  });

  it("menghitung menit terlambat dari jam masuk, bukan dari batas toleransi", () => {
    const result = evaluateAttendance({ checkIn: at("08:20") }, schedule);
    expect(result.status).toBe("LATE");
    expect(result.lateInMinutes).toBe(20);
  });

  it("menandai pulang cepat jika check-out sebelum jam pulang", () => {
    const result = evaluateAttendance({ checkIn: at("08:00"), checkOut: at("16:00") }, schedule);
    expect(result.status).toBe("EARLY_LEAVE");
    expect(result.workHours).toBe(8);
  });

  it("tetap berstatus terlambat walaupun pulang cepat", () => {
    const result = evaluateAttendance({ checkIn: at("09:00"), checkOut: at("16:00") }, schedule);
    expect(result.status).toBe("LATE");
  });

  it("menghitung lembur setelah jam pulang", () => {
    const result = evaluateAttendance({ checkIn: at("08:00"), checkOut: at("18:30") }, schedule);
    expect(result.status).toBe("PRESENT");
    expect(result.isOvertime).toBe(true);
    expect(result.overtimeHours).toBe(1.5);
  });
});
