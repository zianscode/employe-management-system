import { prisma } from "@/server/db/prisma";
import { PayrollComponentType } from "@prisma/client";
import { z } from "zod";
import { PayrollComponentRow } from "@/shared/types/salary.types";

const ComponentSchema = z.object({
  name: z.string().trim().min(2, "Nama komponen minimal 2 karakter"),
  type: z.nativeEnum(PayrollComponentType),
  amount: z.coerce.number().int("Nominal harus bilangan bulat").positive("Nominal harus lebih dari 0"),
});

export type PayrollComponentInput = z.infer<typeof ComponentSchema>;

class PayrollComponentService {
  async list(employeeId: string): Promise<PayrollComponentRow[]> {
    const components = await prisma.payrollComponent.findMany({
      where: { employeeId },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    });
    return components.map((c) => ({ id: c.id, name: c.name, type: c.type, amount: c.amount }));
  }

  async create(employeeId: string, input: PayrollComponentInput) {
    const data = ComponentSchema.parse(input);
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } });
    if (!employee) throw new Error("Karyawan tidak ditemukan");
    return prisma.payrollComponent.create({ data: { ...data, employeeId } });
  }

  async remove(id: string) {
    await prisma.payrollComponent.delete({ where: { id } });
  }
}

export const payrollComponentService = new PayrollComponentService();
