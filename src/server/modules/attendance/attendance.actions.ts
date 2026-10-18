"use server";

import { revalidatePath } from "next/cache";
import { requireEmployee, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { Attendance, MyTodayAttendance } from "@/shared/types/attendance.types";
import { formatTime } from "@/shared/utils/date";
import { attendanceService } from "./attendance.service";

const refresh = () => {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
};

export async function clockInAction() {
  try {
    const user = await requireEmployee();
    const result = await attendanceService.clockIn(user.employeeId);
    refresh();
    return ApiResponse.success(
      result.status === "LATE"
        ? `Check-in ${formatTime(result.checkIn!)} (terlambat ${result.lateInMinutes} menit)`
        : `Check-in berhasil pukul ${formatTime(result.checkIn!)}`
    );
  } catch (error) {
    return ApiResponse.fromError(error, "Terjadi kesalahan saat check-in");
  }
}

export async function clockOutAction() {
  try {
    const user = await requireEmployee();
    const result = await attendanceService.clockOut(user.employeeId);
    refresh();
    return ApiResponse.success(`Check-out berhasil pukul ${formatTime(result.checkOut!)}`);
  } catch (error) {
    return ApiResponse.fromError(error, "Terjadi kesalahan saat check-out");
  }
}

export async function getMyTodayAttendanceAction() {
  try {
    const user = await requireEmployee();
    return ApiResponse.success("Absensi hari ini", await attendanceService.getMyToday(user.employeeId));
  } catch (error) {
    return ApiResponse.fromError<MyTodayAttendance>(error, "Gagal mengambil absensi hari ini");
  }
}

export async function getDailyAttendanceAction(dateKey: string) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Rekap absensi", await attendanceService.getDaily(user, dateKey));
  } catch (error) {
    return ApiResponse.fromError<Attendance[]>(error, "Gagal mengambil data absensi");
  }
}

export async function getAttendanceStatsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Statistik absensi", await attendanceService.getTodayStats(user));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil statistik absensi");
  }
}
