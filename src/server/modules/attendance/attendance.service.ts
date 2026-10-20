import { prisma } from "@/server/db/prisma";
import { AttendanceStatus, EmployeeStatus, LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { employeeScopeFor } from "@/server/auth/scope";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { holidayService } from "@/server/modules/settings/holiday.service";
import { evaluateAttendance } from "./attendance.rules";
import {
  Attendance,
  AttendanceMonthlyRow,
  AttendanceMonthlySummary,
  DailyAttendanceStatus,
  MyTodayAttendance,
} from "@/shared/types/attendance.types";
import {
  dateKeyToDate,
  dateToDateKey,
  formatDate,
  formatTime,
  isWorkingDay,
  minutesOfDay,
  monthRange,
  parseTimeToMinutes,
  toDateKey,
} from "@/shared/utils/date";

const ACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION];
const PRESENT_STATUSES: DailyAttendanceStatus[] = [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.EARLY_LEAVE];

const round2 = (n: number) => Math.round(n * 100) / 100;

function formatWorkHours(hours: number) {
  if (!hours) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h} jam ${m} mnt` : `${h} jam`;
}

interface ApprovedLeave {
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
}

const leaveStatusOf = (leave: ApprovedLeave): DailyAttendanceStatus =>
  leave.type === LeaveType.SICK ? AttendanceStatus.SICK : AttendanceStatus.PERMISSION;

class AttendanceService {
  private async approvedLeavesBetween(employeeIds: string[], start: Date, end: Date): Promise<ApprovedLeave[]> {
    return prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: LeaveStatus.HR_APPROVED,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { employeeId: true, type: true, startDate: true, endDate: true },
    });
  }

  private async isWorkDayOver(dateKey: string) {
    const todayKey = toDateKey();
    if (dateKey !== todayKey) return dateKey < todayKey;
    const setting = await companySettingService.get();
    return minutesOfDay() > parseTimeToMinutes(setting.workEndTime);
  }

  private classifyWithoutRecord(input: {
    dateKey: string;
    joinDate: Date | null;
    leave: ApprovedLeave | undefined;
    workDayOver: boolean;
    holidays: Set<string>;
  }): DailyAttendanceStatus | null {
    if (!isWorkingDay(dateKeyToDate(input.dateKey), input.holidays)) return null;
    if (input.joinDate && toDateKey(input.joinDate) > input.dateKey) return null;
    if (input.leave) return leaveStatusOf(input.leave);
    return input.workDayOver ? AttendanceStatus.ABSENT : "NOT_YET";
  }

  async getMyToday(employeeId: string): Promise<MyTodayAttendance> {
    const setting = await companySettingService.get();
    const date = dateKeyToDate(toDateKey());

    const [record, leaves] = await Promise.all([
      prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date } } }),
      this.approvedLeavesBetween([employeeId], date, date),
    ]);

    let status: DailyAttendanceStatus = record?.status ?? "NOT_YET";
    if (!record && leaves[0]) status = leaveStatusOf(leaves[0]);

    return {
      date: formatDate(date),
      checkIn: record?.checkIn ? formatTime(record.checkIn) : null,
      checkOut: record?.checkOut ? formatTime(record.checkOut) : null,
      status,
      lateInMinutes: record?.lateInMinutes ?? 0,
      workStartTime: setting.workStartTime,
      workEndTime: setting.workEndTime,
      onLeave: leaves.length > 0,
    };
  }

  async clockIn(employeeId: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { status: true } });
    if (!employee || !ACTIVE_STATUSES.includes(employee.status)) throw new Error("Karyawan tidak aktif");

    const now = new Date();
    const date = dateKeyToDate(toDateKey(now));

    if ((await this.approvedLeavesBetween([employeeId], date, date)).length > 0) {
      throw new Error("Anda sedang cuti hari ini");
    }

    const setting = await companySettingService.get();
    const { status, lateInMinutes } = evaluateAttendance({ checkIn: now }, setting);

    try {
      return await prisma.attendance.create({
        data: { employeeId, date, checkIn: now, status, lateInMinutes },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Anda sudah check-in hari ini");
      }
      throw error;
    }
  }

  async clockOut(employeeId: string) {
    const now = new Date();
    const date = dateKeyToDate(toDateKey(now));

    const attendance = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date } } });
    if (!attendance?.checkIn) throw new Error("Anda belum check-in hari ini");
    if (attendance.checkOut) throw new Error("Anda sudah check-out hari ini");

    const setting = await companySettingService.get();
    const evaluated = evaluateAttendance({ checkIn: attendance.checkIn, checkOut: now }, setting);

    return prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now, ...evaluated },
    });
  }

  async getDaily(user: CurrentUser, dateKey: string): Promise<Attendance[]> {
    const date = dateKeyToDate(dateKey);
    if (isNaN(date.getTime())) throw new Error("Tanggal tidak valid");

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          employeeScopeFor(user),
          { OR: [{ status: { in: ACTIVE_STATUSES } }, { attendances: { some: { date } } }] },
        ],
      },
      select: { id: true, name: true, nip: true, joinDate: true },
      orderBy: { name: "asc" },
    });
    const ids = employees.map((e) => e.id);

    const [records, leaves, workDayOver, holidays] = await Promise.all([
      prisma.attendance.findMany({ where: { date, employeeId: { in: ids } } }),
      this.approvedLeavesBetween(ids, date, date),
      this.isWorkDayOver(dateKey),
      holidayService.keysBetween(date, date),
    ]);
    const recordBy = new Map(records.map((r) => [r.employeeId, r]));
    const leaveBy = new Map(leaves.map((l) => [l.employeeId, l]));

    const rows: Attendance[] = [];
    for (const emp of employees) {
      const record = recordBy.get(emp.id);
      const base = { employeeId: emp.id, nip: emp.nip || "-", nama: emp.name, tanggal: formatDate(date) };

      if (record) {
        rows.push({
          ...base,
          jamMasuk: record.checkIn ? formatTime(record.checkIn) : "-",
          jamKeluar: record.checkOut ? formatTime(record.checkOut) : "-",
          jamKerja: formatWorkHours(record.workHours),
          status: record.status,
          keterangan: [
            record.lateInMinutes ? `Terlambat ${record.lateInMinutes} menit` : "",
            record.isOvertime ? `Lembur ${record.overtimeHours} jam` : "",
          ].filter(Boolean).join(", "),
        });
        continue;
      }

      const leave = leaveBy.get(emp.id);
      const status = this.classifyWithoutRecord({ dateKey, joinDate: emp.joinDate, leave, workDayOver, holidays });
      if (!status) continue;

      rows.push({ ...base, jamMasuk: "-", jamKeluar: "-", jamKerja: "-", status, keterangan: leave ? "Cuti disetujui" : "" });
    }
    return rows;
  }

  async getMonthlySummary(user: CurrentUser, month: number, year: number): Promise<AttendanceMonthlySummary> {
    const { start, end } = monthRange(month, year);
    const todayKey = toDateKey();
    const lastKey = dateToDateKey(end) < todayKey ? dateToDateKey(end) : todayKey;

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          employeeScopeFor(user),
          { OR: [{ status: { in: ACTIVE_STATUSES } }, { attendances: { some: { date: { gte: start, lte: end } } } }] },
        ],
      },
      select: { id: true, name: true, nip: true, joinDate: true, department: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
    const ids = employees.map((e) => e.id);

    const [records, leaves, todayOver, holidays] = await Promise.all([
      prisma.attendance.findMany({ where: { employeeId: { in: ids }, date: { gte: start, lte: end } } }),
      this.approvedLeavesBetween(ids, start, end),
      this.isWorkDayOver(todayKey),
      holidayService.keysBetween(start, end),
    ]);

    const recordKey = (employeeId: string, dateKey: string) => `${employeeId}|${dateKey}`;
    const recordBy = new Map(records.map((r) => [recordKey(r.employeeId, dateToDateKey(r.date)), r]));

    const rows: AttendanceMonthlyRow[] = employees.map((emp) => ({
      employeeId: emp.id,
      nip: emp.nip || "-",
      nama: emp.name,
      divisi: emp.department?.name || "-",
      hadir: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      menitTerlambat: 0,
      jamLembur: 0,
    }));

    const cursor = new Date(start);
    while (dateToDateKey(cursor) <= lastKey) {
      const dateKey = dateToDateKey(cursor);
      const workDayOver = dateKey < todayKey || todayOver;

      employees.forEach((emp, i) => {
        const row = rows[i];
        const record = recordBy.get(recordKey(emp.id, dateKey));
        let status: DailyAttendanceStatus | null;

        if (record) {
          status = record.status;
          row.menitTerlambat += record.lateInMinutes;
          row.jamLembur = round2(row.jamLembur + record.overtimeHours);
        } else {
          const leave = leaves.find((l) => l.employeeId === emp.id && l.startDate <= cursor && l.endDate >= cursor);
          status = this.classifyWithoutRecord({ dateKey, joinDate: emp.joinDate, leave, workDayOver, holidays });
        }

        if (!status) return;
        if (PRESENT_STATUSES.includes(status)) row.hadir++;
        if (status === AttendanceStatus.LATE) row.terlambat++;
        if (status === AttendanceStatus.PERMISSION) row.izin++;
        if (status === AttendanceStatus.SICK) row.sakit++;
        if (status === AttendanceStatus.ABSENT) row.alpha++;
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const sum = (key: "hadir" | "terlambat" | "izin" | "sakit" | "alpha") => rows.reduce((acc, r) => acc + r[key], 0);
    const totals = { hadir: sum("hadir"), terlambat: sum("terlambat"), izin: sum("izin"), sakit: sum("sakit"), alpha: sum("alpha") };
    const recorded = totals.hadir + totals.izin + totals.sakit + totals.alpha;

    return {
      rows,
      totals,
      attendanceRate: recorded ? Math.round((totals.hadir / recorded) * 100) : 0,
    };
  }

  async getTodayStats(user: CurrentUser) {
    const rows = await this.getDaily(user, toDateKey());
    const count = (statuses: DailyAttendanceStatus[]) => rows.filter((r) => statuses.includes(r.status)).length;
    const onLeave = count([AttendanceStatus.PERMISSION, AttendanceStatus.SICK]);

    return [
      { label: "Total Karyawan", value: rows.length.toString(), change: "", type: "neutral" as const },
      { label: "Hadir", value: count(PRESENT_STATUSES).toString(), change: "", type: "success" as const },
      { label: "Terlambat", value: count([AttendanceStatus.LATE]).toString(), change: "", type: "warning" as const },
      {
        label: "Tidak Hadir",
        value: count([AttendanceStatus.ABSENT, "NOT_YET"]).toString(),
        change: onLeave ? `${onLeave} cuti` : "",
        type: "danger" as const,
      },
    ];
  }
}

export const attendanceService = new AttendanceService();
