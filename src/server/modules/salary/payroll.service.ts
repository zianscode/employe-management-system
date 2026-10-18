import { prisma } from "@/server/db/prisma";

export class PayrollService {
  async calculateMonthlySalary(employeeId: string, month: number, year: number) {
    // 1. Get Employee & Base Data
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { position: true }
    });
    if (!employee) throw new Error("Employee not found");

    const basicSalary = employee.salaryBase || 0;

    // 2. Calculate Overtime from Attendance
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        },
        isOvertime: true
      }
    });

    const totalOvertimeHours = attendances.reduce((acc, curr) => acc + curr.overtimeHours, 0);
    const overtimePay = totalOvertimeHours * 50000; // Contoh rate lembur per jam

    // 3. Calculate Unpaid Leave Deductions
    const unpaidLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        type: "UNPAID",
        status: "HR_APPROVED",
        startDate: { gte: new Date(year, month - 1, 1) },
        endDate: { lte: new Date(year, month, 0) }
      }
    });

    const totalUnpaidDays = unpaidLeaves.reduce((acc, curr) => acc + curr.duration, 0);
    const unpaidLeaveCut = (basicSalary / 22) * totalUnpaidDays; // Contoh hitungan per hari kerja

    // 4. Final Calculation
    const totalGross = basicSalary + overtimePay;
    const totalNet = totalGross - unpaidLeaveCut;

    // 5. Upsert Payroll Record
    return await prisma.salary.upsert({
      where: {
        employeeId_periodMonth_periodYear: { employeeId, periodMonth: month, periodYear: year }
      },
      update: { basicSalary, overtimePay, unpaidLeaveCut, totalGross, totalNet },
      create: {
        employeeId,
        periodMonth: month,
        periodYear: year,
        basicSalary,
        totalGross,
        totalNet,
        overtimePay,
        unpaidLeaveCut
      }
    });
  }
}
