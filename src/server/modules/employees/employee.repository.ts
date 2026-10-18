import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, EmploymentType, Prisma } from "@prisma/client";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { hashPassword } from "@/server/utils/password";
import { normalizeEmail } from "@/shared/utils/format";

type Tx = Prisma.TransactionClient;

class EmployeeRepository {
  async findAll(filters?: { status?: EmployeeStatus; departmentId?: string }) {
    return prisma.employee.findMany({
      where: filters,
      include: { department: true, position: true, manager: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: { department: true, position: true, manager: true, user: true },
    });
  }

  async emailExists(email: string, excludeEmployeeId?: string) {
    const excluded = excludeEmployeeId
      ? await prisma.employee.findUnique({ where: { id: excludeEmployeeId }, select: { userId: true } })
      : null;

    const [employee, user] = await Promise.all([
      prisma.employee.findFirst({ where: { email, NOT: excludeEmployeeId ? { id: excludeEmployeeId } : undefined } }),
      prisma.user.findFirst({ where: { email, NOT: excluded?.userId ? { id: excluded.userId } : undefined } }),
    ]);
    return !!employee || !!user;
  }

  async resolveUniqueNip(nip: string, excludeEmployeeId?: string) {
    const taken = async (value: string) =>
      !!(await prisma.employee.findFirst({
        where: { nip: value, NOT: excludeEmployeeId ? { id: excludeEmployeeId } : undefined },
      }));

    if (!nip || !(await taken(nip))) return nip;

    const match = nip.match(/^(.*?)(\d{3})$/);
    if (!match) throw new Error(`NIP ${nip} sudah terdaftar`);

    const prefix = match[1];
    for (let seq = Number(match[2]) + 1; seq <= 999; seq++) {
      const candidate = `${prefix}${String(seq).padStart(3, "0")}`;
      if (!(await taken(candidate))) return candidate;
    }
    throw new Error(`Nomor urut NIP untuk ${prefix} sudah habis`);
  }

  private async resolvePositionId(tx: Tx, positionId?: string, customPosition?: string) {
    if (positionId === "OTHER") {
      if (!customPosition?.trim()) return undefined;
      const position = await tx.position.upsert({
        where: { name: customPosition.trim() },
        update: {},
        create: { name: customPosition.trim(), salaryBase: 0 },
      });
      return position.id;
    }
    return positionId || undefined;
  }

  async create(data: EmployeeFormData) {
    const normalizedEmail = normalizeEmail(data.email);
    const setting = await companySettingService.get();

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw new Error("Role tidak ditemukan");
    const defaultPassword = `${role.name.toLowerCase().replace(/_/g, "")}123`;
    const hashedPassword = await hashPassword(defaultPassword);

    const employee = await prisma.$transaction(async (tx) => {
      const positionId = await this.resolvePositionId(tx, data.positionId, data.customPosition);
      const position = positionId ? await tx.position.findUnique({ where: { id: positionId } }) : null;

      const user = await tx.user.create({
        data: { email: normalizedEmail, password: hashedPassword, roleId: role.id },
      });

      return tx.employee.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          nip: data.nip || null,
          gender: data.gender,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          employmentType: data.employmentType as EmploymentType,
          status: data.status,
          joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
          salaryBase: data.salaryBase && data.salaryBase > 0 ? Math.round(data.salaryBase) : position?.salaryBase ?? 0,
          leaveQuota: setting.annualLeaveQuota,
          isProfileComplete: false,
          user: { connect: { id: user.id } },
          ...(data.departmentId ? { department: { connect: { id: data.departmentId } } } : {}),
          ...(positionId ? { position: { connect: { id: positionId } } } : {}),
          ...(data.managerId ? { manager: { connect: { id: data.managerId } } } : {}),
        },
      });
    });

    return { employee, defaultPassword };
  }

  async update(id: string, data: Partial<EmployeeFormData>) {
    const normalizedEmail = data.email ? normalizeEmail(data.email) : undefined;

    return prisma.$transaction(async (tx) => {
      const positionId = await this.resolvePositionId(tx, data.positionId, data.customPosition);

      const employee = await tx.employee.update({
        where: { id },
        data: {
          name: data.name,
          email: normalizedEmail,
          nip: data.nip,
          gender: data.gender,
          status: data.status,
          avatar: data.avatar,
          joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          employmentType: data.employmentType,
          salaryBase: data.salaryBase !== undefined ? Math.max(0, Math.round(data.salaryBase)) : undefined,
          ...(positionId ? { position: { connect: { id: positionId } } } : {}),
          ...(data.departmentId ? { department: { connect: { id: data.departmentId } } } : {}),
          ...(data.managerId !== undefined
            ? { manager: data.managerId ? { connect: { id: data.managerId } } : { disconnect: true } }
            : {}),
        },
      });

      if (employee.userId && (normalizedEmail || data.roleId)) {
        await tx.user.update({
          where: { id: employee.userId },
          data: { email: normalizedEmail, roleId: data.roleId || undefined },
        });
      }

      return employee;
    });
  }

  async countHistory(id: string) {
    const [attendances, leaveRequests, salaries] = await Promise.all([
      prisma.attendance.count({ where: { employeeId: id } }),
      prisma.leaveRequest.count({ where: { employeeId: id } }),
      prisma.salary.count({ where: { employeeId: id } }),
    ]);
    return attendances + leaveRequests + salaries;
  }

  async delete(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id }, select: { userId: true } });

    return prisma.$transaction(async (tx) => {
      await tx.employee.updateMany({ where: { managerId: id }, data: { managerId: null } });
      await tx.employee.delete({ where: { id } });
      if (employee?.userId) {
        await tx.user.delete({ where: { id: employee.userId } });
      }
    });
  }
}

export const employeeRepository = new EmployeeRepository();
