"use server";

import { AttendanceService } from "./attendance.service";
import { ApiResponse } from "@/server/utils/api-response";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";

const service = new AttendanceService();

export async function clockInAction(employeeId: string) {
  try {
    const result = await service.clockIn(employeeId);
    revalidatePath("/dashboard/attendance");
    return ApiResponse.success("Berhasil Check-In", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat check-in";
    return ApiResponse.error(errorMessage);
  }
}

export async function clockOutAction(employeeId: string) {
  try {
    const result = await service.clockOut(employeeId);
    revalidatePath("/dashboard/attendance");
    return ApiResponse.success("Berhasil Check-Out", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat check-out";
    return ApiResponse.error(errorMessage);
  }
}

export async function getAttendanceHistoryAction(filters?: Prisma.AttendanceWhereInput) {
  try {
    const data = await service.getAttendanceHistory(filters);
    return ApiResponse.success("Riwayat absensi berhasil diambil", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil riwayat absensi";
    return ApiResponse.error(errorMessage);
  }
}

export async function getAttendanceStatsAction() {
  try {
    const data = await service.getStats();
    return ApiResponse.success("Stats berhasil diambil", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil stats";
    return ApiResponse.error(errorMessage);
  }
}

type AttendanceWithEmployee = Prisma.AttendanceGetPayload<{
  include: { employee: true };
}>;

export async function getAttendance() {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        employee: true,
      },
      orderBy: { date: "desc" },
    });
    
    return attendance.map((att: AttendanceWithEmployee) => ({
      nip: att.employee.nip || "N/A",
      nama: att.employee.name,
      tanggal: att.date.toLocaleDateString('id-ID'),
      jamMasuk: att.checkIn || "-",
      jamKeluar: att.checkOut || "-",
      jamKerja: att.workHours || "-",
      status: att.status as string,
    }));
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return [];
  }
}

export async function logAttendance(nip: string, type: "checkIn" | "checkOut") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: nip, // Menggunakan NIP sebagai ID Karyawan
        date: today,
      },
    });

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (type === "checkIn") {
      if (existing) return { success: false, error: "Already checked in today" };
      await prisma.attendance.create({
        data: {
          employeeId: nip,
          date: today,
          checkIn: now,
          status: "PRESENT",
        },
      });
    } else {
      if (!existing) return { success: false, error: "Must check in first" };
      if (existing.checkOut) return { success: false, error: "Already checked out today" };
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: now,
        },
      });
    }

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("Failed to log attendance:", error);
    return { success: false, error: "Database error" };
  }
}
