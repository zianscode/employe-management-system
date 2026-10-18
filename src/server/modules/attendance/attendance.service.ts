import { prisma } from "@/server/db/prisma";
import { AttendanceStatus, EmployeeStatus, LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { ROLES, isAdminRole } from "@/shared/constants/roles";
import { Attendance, DailyAttendanceStatus, MyTodayAttendance } from "@/shared/types/attendance.types";
import {
  dateKeyToDate,
  formatDate,
  formatTime,
  isWeekend,
  minutesOfDay,
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

class AttendanceService {
  private employeeScope(user: CurrentUser): Prisma.EmployeeWhereInput {
    if (isAdminRole(user.role)) return {};
    if (!user.employeeId) return { id: "__none__" };
    if (user.role === ROLES.MANAGER) return { OR: [{ id: user.employeeId }, { managerId: user.employeeId }] };
    return { id: user.employeeId };
  }

  private async approvedLeaveOn(employeeIds: string[], date: Date) {
    return prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: LeaveStatus.HR_APPROVED,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      select: { employeeId: true, type: true },
    });
  }

  async getMyToday(employeeId: string): Promise<MyTodayAttendance> {
    const setting = await companySettingService.get();
    const dateKey = toDateKey();
    const date = dateKeyToDate(dateKey);

    const [record, leaves] = await Promise.all([
      prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date } } }),
      this.approvedLeaveOn([employeeId], date),
    ]);

    let status: DailyAttendanceStatus = record?.status ?? "NOT_YET";
    if (!record && leaves[0]) status = leaves[0].type === LeaveType.SICK ? AttendanceStatus.SICK : AttendanceStatus.PERMISSION;

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

    if ((await this.approvedLeaveOn([employeeId], date)).length > 0) {
      throw new Error("Anda sedang cuti hari ini");
    }

    const setting = await companySettingService.get();
    const lateBy = minutesOfDay(now) - parseTimeToMinutes(setting.workStartTime);
    const isLate = lateBy > setting.lateToleranceMinutes;

    try {
      return await prisma.attendance.create({
        data: {
          employeeId,
          date,
          checkIn: now,
          status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          lateInMinutes: isLate ? lateBy : 0,
        },
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
    const endMinutes = parseTimeToMinutes(setting.workEndTime);
    const nowMinutes = minutesOfDay(now);

    const overtimeHours = nowMinutes > endMinutes ? round2((nowMinutes - endMinutes) / 60) : 0;
    const leftEarly = nowMinutes < endMinutes && attendance.status === AttendanceStatus.PRESENT;

    return prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: round2((now.getTime() - attendance.checkIn.getTime()) / 3_600_000),
        overtimeHours,
        isOvertime: overtimeHours > 0,
        ...(leftEarly ? { status: AttendanceStatus.EARLY_LEAVE } : {}),
      },
    });
  }

  async getDaily(user: CurrentUser, dateKey: string): Promise<Attendance[]> {
    const date = dateKeyToDate(dateKey);
    if (isNaN(date.getTime())) throw new Error("Tanggal tidak valid");

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          this.employeeScope(user),
          { OR: [{ status: { in: ACTIVE_STATUSES } }, { attendances: { some: { date } } }] },
        ],
      },
      select: { id: true, name: true, nip: true, joinDate: true },
      orderBy: { name: "asc" },
    });
    const ids = employees.map((e) => e.id);

    const [records, leaves, setting] = await Promise.all([
      prisma.attendance.findMany({ where: { date, employeeId: { in: ids } } }),
      this.approvedLeaveOn(ids, date),
      companySettingService.get(),
    ]);
    const recordBy = new Map(records.map((r) => [r.employeeId, r]));
    const leaveBy = new Map(leaves.map((l) => [l.employeeId, l]));

    const todayKey = toDateKey();
    const workDayOver = dateKey < todayKey || (dateKey === todayKey && minutesOfDay() > parseTimeToMinutes(setting.workEndTime));

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

      if (isWeekend(date)) continue;
      if (emp.joinDate && toDateKey(emp.joinDate) > dateKey) continue;

      const leave = leaveBy.get(emp.id);
      const status: DailyAttendanceStatus = leave
        ? leave.type === LeaveType.SICK ? AttendanceStatus.SICK : AttendanceStatus.PERMISSION
        : workDayOver ? AttendanceStatus.ABSENT : "NOT_YET";

      rows.push({ ...base, jamMasuk: "-", jamKeluar: "-", jamKerja: "-", status, keterangan: leave ? "Cuti disetujui" : "" });
    }
    return rows;
  }

  async getTodayStats(user: CurrentUser) {
    const rows = await this.getDaily(user, toDateKey());
    const count = (statuses: DailyAttendanceStatus[]) => rows.filter((r) => statuses.includes(r.status)).length;

    return [
      { label: "Total Karyawan", value: rows.length.toString(), change: "", type: "neutral" as const },
      { label: "Hadir", value: count(PRESENT_STATUSES).toString(), change: "", type: "success" as const },
      { label: "Terlambat", value: count([AttendanceStatus.LATE]).toString(), change: "", type: "warning" as const },
      {
        label: "Tidak Hadir",
        value: count([AttendanceStatus.ABSENT, "NOT_YET"]).toString(),
        change: count([AttendanceStatus.PERMISSION, AttendanceStatus.SICK]) ? `${count([AttendanceStatus.PERMISSION, AttendanceStatus.SICK])} cuti` : "",
        type: "danger" as const,
      },
    ];
  }
}

export const attendanceService = new AttendanceService();
