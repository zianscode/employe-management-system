"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";
import { PayrollService } from "./payroll.service";
import { ApiResponse } from "@/server/utils/api-response";

export async function getSalaries() {
  try {
    const salaries = await prisma.salary.findMany({
      include: {
        employee: {
          include: {
            position: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return salaries.map(s => ({
      nip: s.employee.nip,
      name: s.employee.name,
      position: s.employee.position?.name || "N/A",
      basicSalary: s.basicSalary,
      allowance: s.allowances,
      deduction: s.deductions,
      totalSalary: s.totalNet,
      status: s.isPaid ? "Dibayar" : "Pending",
    }));
  } catch (error) {
    console.error("Failed to fetch salaries:", error);
    return [];
  }
}

export async function generateSalary(nip: string, month: number, year: number) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { nip },
    });

    if (!employee) throw new Error("Employee not found");

    // Mock logic for calculation (could be more complex based on attendance)
    const basicSalary = employee.salaryBase || 0;
    const allowances = 500000;
    const deductions = 0;
    const totalGross = basicSalary + allowances;
    const totalNet = totalGross - deductions;

    const salary = await prisma.salary.create({
      data: {
        employeeId: employee.id,
        basicSalary,
        allowances,
        deductions,
        totalGross,
        totalNet,
        periodMonth: month,
        periodYear: year,
        isPaid: true,
        paidAt: new Date(),
      },
    });

    revalidatePath("/dashboard/salary");
    return { success: true, data: salary };
  } catch (error) {
    console.error("Failed to generate salary:", error);
    return { success: false, error: "Calculation failed" };
  }
}

const service = new PayrollService();

export async function calculatePayrollAction(employeeId: string, month: number, year: number) {
  try {
    const result = await service.calculateMonthlySalary(employeeId, month, year);
    revalidatePath("/dashboard/salary");
    return ApiResponse.success("Gaji bulanan berhasil dihitung", result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal menghitung gaji bulanan";
    return ApiResponse.error(errorMessage);
  }
}
