import { prisma } from "@/server/db/prisma";
import { CorrectionStatus, EmployeeStatus, Prisma } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { employeeScopeFor } from "@/server/auth/scope";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { ROLES, isAdminRole } from "@/shared/constants/roles";
import { AttendanceCorrectionInput, AttendanceCorrectionRow } from "@/shared/types/attendance.types";
import { dateKeyToDate, formatDate, formatTime, toDateKey, zonedDateTime } from "@/shared/utils/date";
import { evaluateAttendance } from "./attendance.rules";

const MAX_DAYS_BACK = 30;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const ACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION];

const correctionInclude = {
  employee: { select: { id: true, name: true, nip: true, managerId: true } },
  reviewedBy: { select: { name: true } },
} satisfies Prisma.AttendanceCorrectionInclude;

type CorrectionWithRelations = Prisma.AttendanceCorrectionGetPayload<{ include: typeof correctionInclude }>;

class AttendanceCorrectionService {
  private canReview(c: CorrectionWithRelations, user: CurrentUser) {
    if (c.status !== CorrectionStatus.PENDING || !user.employeeId) return false;
    if (c.employeeId === user.employeeId && user.role !== ROLES.SUPER_ADMIN) return false;
    if (isAdminRole(user.role)) return true;
    return user.role === ROLES.MANAGER && c.employee.managerId === user.employeeId;
  }

  private canCancel(c: CorrectionWithRelations, user: CurrentUser) {
    return c.status === CorrectionStatus.PENDING && c.employeeId === user.employeeId;
  }

  private toRow(c: CorrectionWithRelations, user: CurrentUser): AttendanceCorrectionRow {
    return {
      id: c.id,
      employeeId: c.employeeId,
      nip: c.employee.nip || "-",
      nama: c.employee.name,
      tanggal: formatDate(c.date),
      jamMasuk: c.checkIn ? formatTime(c.checkIn) : "-",
      jamKeluar: c.checkOut ? formatTime(c.checkOut) : "-",
      reason: c.reason,
      status: c.status,
      reviewedBy: c.reviewedBy?.name ?? null,
      rejectionReason: c.rejectionReason,
      canReview: this.canReview(c, user),
      canCancel: this.canCancel(c, user),
    };
  }

  private async findForAction(id: string, user: CurrentUser) {
    const correction = await prisma.attendanceCorrection.findFirst({
      where: { id, employee: employeeScopeFor(user) },
      include: correctionInclude,
    });
    if (!correction) throw new Error("Pengajuan koreksi tidak ditemukan");
    return correction;
  }

  async countAwaitingReview(user: CurrentUser) {
    if (!user.employeeId) return 0;
    const notOwn = user.role === ROLES.SUPER_ADMIN ? {} : { employeeId: { not: user.employeeId } };

    if (isAdminRole(user.role)) {
      return prisma.attendanceCorrection.count({ where: { status: CorrectionStatus.PENDING, ...notOwn } });
    }
    if (user.role === ROLES.MANAGER) {
      return prisma.attendanceCorrection.count({
        where: { status: CorrectionStatus.PENDING, employee: { managerId: user.employeeId }, ...notOwn },
      });
    }
    return 0;
  }

  async list(user: CurrentUser): Promise<AttendanceCorrectionRow[]> {
    const corrections = await prisma.attendanceCorrection.findMany({
      where: { employee: employeeScopeFor(user) },
      include: correctionInclude,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return corrections.map((c) => this.toRow(c, user));
  }

  async submit(user: CurrentUser & { employeeId: string }, input: AttendanceCorrectionInput) {
    if (!DATE_FORMAT.test(input.date)) throw new Error("Tanggal tidak valid");
    if (!input.reason?.trim()) throw new Error("Alasan koreksi wajib diisi");
    if (!input.checkIn && !input.checkOut) throw new Error("Isi jam masuk dan/atau jam pulang");
    for (const time of [input.checkIn, input.checkOut]) {
      if (time && !TIME_FORMAT.test(time)) throw new Error("Format jam harus HH:mm");
    }

    const todayKey = toDateKey();
    const oldestKey = toDateKey(new Date(Date.now() - MAX_DAYS_BACK * 24 * 60 * 60 * 1000));
    if (input.date > todayKey) throw new Error("Tidak bisa mengoreksi tanggal yang belum terjadi");
    if (input.date < oldestKey) throw new Error(`Koreksi hanya bisa untuk ${MAX_DAYS_BACK} hari terakhir`);

    const employee = await prisma.employee.findUnique({ where: { id: user.employeeId }, select: { status: true } });
    if (!employee || !ACTIVE_STATUSES.includes(employee.status)) throw new Error("Karyawan tidak aktif");

    const date = dateKeyToDate(input.date);
    const checkIn = input.checkIn ? zonedDateTime(input.date, input.checkIn) : null;
    const checkOut = input.checkOut ? zonedDateTime(input.date, input.checkOut) : null;

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: user.employeeId, date } },
    });
    const finalCheckIn = checkIn ?? existing?.checkIn ?? null;
    if (!finalCheckIn) throw new Error("Jam masuk wajib diisi karena belum ada catatan check-in di tanggal tersebut");
    if (checkOut && checkOut <= finalCheckIn) throw new Error("Jam pulang harus setelah jam masuk");

    const pending = await prisma.attendanceCorrection.findFirst({
      where: { employeeId: user.employeeId, date, status: CorrectionStatus.PENDING },
    });
    if (pending) throw new Error("Sudah ada pengajuan koreksi yang menunggu untuk tanggal tersebut");

    return prisma.attendanceCorrection.create({
      data: { employeeId: user.employeeId, date, checkIn, checkOut, reason: input.reason.trim() },
    });
  }

  async approve(id: string, user: CurrentUser) {
    const correction = await this.findForAction(id, user);
    if (!this.canReview(correction, user)) throw new Error("Anda tidak berwenang menyetujui koreksi ini");

    const setting = await companySettingService.get();
    const key = { employeeId_date: { employeeId: correction.employeeId, date: correction.date } };

    return prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({ where: key });
      const checkIn = correction.checkIn ?? existing?.checkIn;
      const checkOut = correction.checkOut ?? existing?.checkOut ?? null;
      if (!checkIn) throw new Error("Koreksi tidak memiliki jam masuk");

      const evaluated = evaluateAttendance({ checkIn, checkOut }, setting);
      const notes = `Dikoreksi: ${correction.reason}`;

      await tx.attendance.upsert({
        where: key,
        update: { checkIn, checkOut, notes, ...evaluated },
        create: { employeeId: correction.employeeId, date: correction.date, checkIn, checkOut, notes, ...evaluated },
      });

      return tx.attendanceCorrection.update({
        where: { id },
        data: { status: CorrectionStatus.APPROVED, reviewedById: user.employeeId, reviewedAt: new Date() },
      });
    });
  }

  async reject(id: string, user: CurrentUser, reason: string) {
    const correction = await this.findForAction(id, user);
    if (!this.canReview(correction, user)) throw new Error("Anda tidak berwenang menolak koreksi ini");
    if (!reason?.trim()) throw new Error("Alasan penolakan wajib diisi");

    return prisma.attendanceCorrection.update({
      where: { id },
      data: {
        status: CorrectionStatus.REJECTED,
        reviewedById: user.employeeId,
        reviewedAt: new Date(),
        rejectionReason: reason.trim(),
      },
    });
  }

  async cancel(id: string, user: CurrentUser) {
    const correction = await this.findForAction(id, user);
    if (!this.canCancel(correction, user)) throw new Error("Pengajuan ini tidak dapat dibatalkan");
    return prisma.attendanceCorrection.update({ where: { id }, data: { status: CorrectionStatus.CANCELLED } });
  }
}

export const attendanceCorrectionService = new AttendanceCorrectionService();
