import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, EmploymentType } from "@prisma/client";
import bcrypt from "bcryptjs";

export class EmployeeRepository {
  async findAll(filters?: { status?: EmployeeStatus; departmentId?: string }) {
    return await prisma.employee.findMany({
      where: filters,
      include: {
        department: true,
        position: true,
        manager: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: true,
        subordinates: true,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    nip: string;
    gender: string;
    birthDate: string;
    employmentType: string;
    departmentId: string;
    positionId: string;
    roleId: string;
    status: EmployeeStatus;
    joinDate: string;
    managerId?: string | null;
    customPosition?: string;
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    const roleName = role?.name.toLowerCase().replace(/_/g, "") || "user";
    const defaultPassword = `${roleName}123`;
    
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let finalPositionId = data.positionId;

    if (data.positionId === "OTHER" && data.customPosition) {
      const newPos = await prisma.position.upsert({
        where: { name: data.customPosition },
        update: {},
        create: { name: data.customPosition, salaryBase: 0 }
      });
      finalPositionId = newPos.id;
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          roleId: data.roleId,
        },
      });

      return await tx.employee.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          nip: data.nip,
          gender: data.gender,
          birthDate: new Date(data.birthDate),
          employmentType: data.employmentType as EmploymentType,
          status: data.status,
          joinDate: new Date(data.joinDate),
          isProfileComplete: false,
          user: { connect: { id: user.id } },
          ...(data.departmentId ? { department: { connect: { id: data.departmentId } } } : {}),
          ...(finalPositionId ? { position: { connect: { id: finalPositionId } } } : {}),
          ...(data.managerId ? { manager: { connect: { id: data.managerId } } } : {}),
        },
      });
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    email: string;
    nip: string;
    gender: string;
    birthDate: string;
    employmentType: string;
    departmentId: string;
    positionId: string;
    status: EmployeeStatus;
    joinDate: string;
    managerId?: string | null;
    avatar?: string;
    customPosition?: string;
  }>) {
    let finalPositionId = data.positionId;

    if (data.positionId === "OTHER" && data.customPosition) {
      const newPos = await prisma.position.upsert({
        where: { name: data.customPosition },
        update: {},
        create: { name: data.customPosition, salaryBase: 0 }
      });
      finalPositionId = newPos.id;
    }

    return await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        nip: data.nip,
        gender: data.gender,
        status: data.status,
        avatar: data.avatar,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        employmentType: data.employmentType as EmploymentType,
        ...(finalPositionId ? { position: { connect: { id: finalPositionId } } } : {}),
        ...(data.departmentId ? { department: { connect: { id: data.departmentId } } } : {}),
        ...(data.managerId ? { manager: { connect: { id: data.managerId } } } : {}),
      },
    });
  }

  async delete(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true }
    });

    return await prisma.$transaction(async (tx) => {
      await tx.employee.delete({
        where: { id },
      });

      if (employee?.userId) {
        await tx.user.delete({
          where: { id: employee.userId },
        });
      }
    });
  }
}
