import { AttendanceRepository } from "./attendance.repository";
import { AttendanceStatus, Prisma } from "@prisma/client";

const repository = new AttendanceRepository();

export class AttendanceService {
  private SHIFT_START = "09:00"; // Contoh jam masuk standar

  async clockIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check duplicate
    const existing = await repository.findByEmployeeAndDate(employeeId, today);
    if (existing) throw new Error("Already clocked in today");

    // 2. Calculate Late
    const now = new Date();
    const [startHour, startMin] = this.SHIFT_START.split(":").map(Number);
    const shiftStartTime = new Date();
    shiftStartTime.setHours(startHour, startMin, 0, 0);

    let lateInMinutes = 0;
    let status: AttendanceStatus = "PRESENT";

    if (now > shiftStartTime) {
      lateInMinutes = Math.floor((now.getTime() - shiftStartTime.getTime()) / 60000);
      status = "LATE";
    }

    // 3. Save
    return await repository.create({
      employee: {
        connect: { id: employeeId }
      },
      date: today,
      checkIn: now,
      lateInMinutes,
      status,
    });
  }

  async clockOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find Attendance
    const attendance = await repository.findByEmployeeAndDate(employeeId, today);
    if (!attendance) throw new Error("No clock-in record found for today");
    if (attendance.checkOut) throw new Error("Already clocked out today");

    // 2. Calculate Work Hours
    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn!);
    const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // 3. Update
    return await repository.update(attendance.id, {
      checkOut: checkOutTime,
      workHours: parseFloat(workHours.toFixed(2)),
    });
  }

  async getAttendanceHistory(filters?: Prisma.AttendanceWhereInput) {
    return await repository.findAll(filters);
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmployees, presentCount, lateCount, absentCount] = await Promise.all([
      repository.countEmployees(),
      repository.countAttendanceByStatus("PRESENT", today),
      repository.countAttendanceByStatus("LATE", today),
      repository.countAttendanceByStatus("ABSENT", today),
    ]);

    return [
      { label: "Total Karyawan", value: totalEmployees.toString(), change: "+0", type: "neutral" },
      { label: "Hadir", value: presentCount.toString(), change: "+0", type: "success" },
      { label: "Terlambat", value: lateCount.toString(), change: "+0", type: "warning" },
      { label: "Tidak Hadir", value: absentCount.toString(), change: "+0", type: "danger" },
    ];
  }
}
