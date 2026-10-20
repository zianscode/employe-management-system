import { prisma } from "@/server/db/prisma";
import { EmployeeStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { APPROVER_ROLES } from "@/shared/constants/roles";
import { DepartmentRow, PositionRow } from "@/shared/types/organization.types";

const ACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION];

const DepartmentSchema = z.object({
  name: z.string().trim().min(2, "Nama divisi minimal 2 karakter"),
  description: z.string().trim().nullable().optional(),
});

const PositionSchema = z.object({
  name: z.string().trim().min(2, "Nama jabatan minimal 2 karakter"),
  salaryBase: z.coerce.number().int("Gaji harus bilangan bulat").min(0, "Gaji tidak boleh negatif"),
});

export type DepartmentInput = z.infer<typeof DepartmentSchema>;
export type PositionInput = z.infer<typeof PositionSchema>;

function rethrowUnique(error: unknown, label: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new Error(`${label} dengan nama tersebut sudah ada`);
  }
  throw error;
}

const activeEmployeeCount = { _count: { select: { employees: { where: { status: { in: ACTIVE_STATUSES } } } } } };

class OrganizationService {
  async listDepartments(): Promise<DepartmentRow[]> {
    const departments = await prisma.department.findMany({ include: activeEmployeeCount, orderBy: { name: "asc" } });
    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      employeeCount: d._count.employees,
    }));
  }

  async listPositions(): Promise<PositionRow[]> {
    const positions = await prisma.position.findMany({ include: activeEmployeeCount, orderBy: { name: "asc" } });
    return positions.map((p) => ({
      id: p.id,
      name: p.name,
      salaryBase: p.salaryBase,
      employeeCount: p._count.employees,
    }));
  }

  async listFormOptions() {
    const [departments, positions, managers] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.position.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.employee.findMany({
        where: { status: { in: ACTIVE_STATUSES }, user: { role: { name: { in: APPROVER_ROLES } } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { departments, positions, managers };
  }

  async saveDepartment(input: DepartmentInput, id?: string) {
    const data = DepartmentSchema.parse(input);
    try {
      return id
        ? await prisma.department.update({ where: { id }, data })
        : await prisma.department.create({ data });
    } catch (error) {
      rethrowUnique(error, "Divisi");
    }
  }

  async savePosition(input: PositionInput, id?: string) {
    const data = PositionSchema.parse(input);
    try {
      return id
        ? await prisma.position.update({ where: { id }, data })
        : await prisma.position.create({ data });
    } catch (error) {
      rethrowUnique(error, "Jabatan");
    }
  }

  async deleteDepartment(id: string) {
    const used = await prisma.employee.count({ where: { departmentId: id } });
    if (used > 0) throw new Error(`Divisi masih dipakai oleh ${used} karyawan. Pindahkan karyawan terlebih dahulu.`);
    await prisma.department.delete({ where: { id } });
  }

  async deletePosition(id: string) {
    const used = await prisma.employee.count({ where: { positionId: id } });
    if (used > 0) throw new Error(`Jabatan masih dipakai oleh ${used} karyawan. Ubah jabatan karyawan terlebih dahulu.`);
    await prisma.position.delete({ where: { id } });
  }
}

export const organizationService = new OrganizationService();
