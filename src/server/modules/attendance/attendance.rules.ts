import { AttendanceStatus } from "@prisma/client";
import { minutesOfDay, parseTimeToMinutes } from "@/shared/utils/date";

interface WorkSchedule {
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
}

interface AttendanceTimes {
  checkIn: Date;
  checkOut?: Date | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function evaluateAttendance({ checkIn, checkOut }: AttendanceTimes, schedule: WorkSchedule) {
  const lateBy = minutesOfDay(checkIn) - parseTimeToMinutes(schedule.workStartTime);
  const isLate = lateBy > schedule.lateToleranceMinutes;

  const result: {
    status: AttendanceStatus;
    lateInMinutes: number;
    workHours: number;
    overtimeHours: number;
    isOvertime: boolean;
  } = {
    status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
    lateInMinutes: isLate ? lateBy : 0,
    workHours: 0,
    overtimeHours: 0,
    isOvertime: false,
  };
  if (!checkOut) return result;

  const endMinutes = parseTimeToMinutes(schedule.workEndTime);
  const outMinutes = minutesOfDay(checkOut);

  result.workHours = round2((checkOut.getTime() - checkIn.getTime()) / 3_600_000);
  result.overtimeHours = outMinutes > endMinutes ? round2((outMinutes - endMinutes) / 60) : 0;
  result.isOvertime = result.overtimeHours > 0;
  if (!isLate && outMinutes < endMinutes) result.status = AttendanceStatus.EARLY_LEAVE;

  return result;
}
