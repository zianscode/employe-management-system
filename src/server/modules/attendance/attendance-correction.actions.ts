"use server";

import { revalidatePath } from "next/cache";
import { requireEmployee, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { notificationService, notifyLater } from "@/server/modules/notification/notification.service";
import { auditService } from "@/server/modules/audit/audit.service";
import { AttendanceCorrectionInput, AttendanceCorrectionRow } from "@/shared/types/attendance.types";
import { attendanceCorrectionService } from "./attendance-correction.service";

const refresh = () => {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
};

export async function getAttendanceCorrectionsAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Koreksi absensi", await attendanceCorrectionService.list(user));
  } catch (error) {
    return ApiResponse.fromError<AttendanceCorrectionRow[]>(error, "Gagal mengambil pengajuan koreksi");
  }
}

export async function submitAttendanceCorrectionAction(input: AttendanceCorrectionInput) {
  try {
    const user = await requireEmployee();
    await attendanceCorrectionService.submit(user, input);
    refresh();
    return ApiResponse.success("Pengajuan koreksi absensi terkirim");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengirim pengajuan koreksi");
  }
}

export async function approveAttendanceCorrectionAction(id: string) {
  try {
    const user = await requireEmployee();
    await auditService.track(user, { action: "CORRECTION_APPROVED", entity: "ATTENDANCE_CORRECTION", entityId: id }, () =>
      attendanceCorrectionService.approve(id, user),
    );
    notifyLater(() => notificationService.correctionDecided(id));
    refresh();
    return ApiResponse.success("Koreksi disetujui, data absensi diperbarui");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menyetujui koreksi");
  }
}

export async function rejectAttendanceCorrectionAction(id: string, reason: string) {
  try {
    const user = await requireEmployee();
    await auditService.track(
      user,
      { action: "CORRECTION_REJECTED", entity: "ATTENDANCE_CORRECTION", entityId: id, detail: reason },
      () => attendanceCorrectionService.reject(id, user, reason),
    );
    notifyLater(() => notificationService.correctionDecided(id));
    refresh();
    return ApiResponse.success("Koreksi ditolak");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menolak koreksi");
  }
}

export async function cancelAttendanceCorrectionAction(id: string) {
  try {
    const user = await requireEmployee();
    await attendanceCorrectionService.cancel(id, user);
    refresh();
    return ApiResponse.success("Pengajuan koreksi dibatalkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal membatalkan koreksi");
  }
}
