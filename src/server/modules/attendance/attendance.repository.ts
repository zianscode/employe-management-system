import { prisma } from "@/server/db/prisma";
import { Prisma, AttendanceStatus } from "@prisma/client";

export class AttendanceRepository {
  async findByEmployeeAndDate(employeeId: string, date: Date) {
    return await prisma.attendance.findFirst({
      where: {
        employee: {
          id: employeeId
        },
        date,
      },
    });
  }

  async create(data: Prisma.AttendanceCreateInput) {
    return await prisma.attendance.create({
      data,
    });
  }

  async update(id: string, data: Prisma.AttendanceUpdateInput) {
    return await prisma.attendance.update({
      where: { id },
      data,
    });
  }

  async findAll(filters?: Prisma.AttendanceWhereInput) {
    return await prisma.attendance.findMany({
      where: filters,
      include: { employee: true },
      orderBy: { date: "desc" },
    });
  }

  async countEmployees() {
    return await prisma.employee.count();
  }

  async countAttendanceByStatus(status: AttendanceStatus, date: Date) {
    return await prisma.attendance.count({
      where: {
        status,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
  }
}
