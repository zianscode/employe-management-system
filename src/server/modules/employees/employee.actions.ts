"use server";

import { prisma } from "@/server/db/prisma";
import { EmployeeService } from "./employee.service";
import { ApiResponse } from "@/server/utils/api-response";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { Employee, EmployeeFormData } from "@/shared/types/employee.types";

export async function getRolesAction() {
  try {
    const roles = await prisma.role.findMany();
    return ApiResponse.success("Roles fetched", roles);
  } catch {
    return ApiResponse.error("Failed to fetch roles");
  }
}

const service = new EmployeeService();

export async function getEmployeesAction(filters?: Record<string, string | undefined>) {
  try {
    const rawData = await service.getAllEmployees(filters);
    
    // Map Prisma objects to domain Entity
    const data = rawData.map((emp: { 
      id: string;
      name: string;
      email: string;
      nip: string | null;
      status: string;
      joinDate: Date | null;
      avatar: string | null;
      department: { name: string } | null; 
      position: { name: string } | null; 
    }) => {
      let probationDaysLeft: number | null = null;
      if (emp.status === "PROBATION" && emp.joinDate) {
        const join = new Date(emp.joinDate);
        const probationEnd = new Date(join);
        probationEnd.setMonth(probationEnd.getMonth() + 3); // 3 months probation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        probationEnd.setHours(0, 0, 0, 0);
        const diffTime = probationEnd.getTime() - today.getTime();
        probationDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        nip: emp.nip || "-",
        status: emp.status,
        division: emp.department?.name || "-",
        position: emp.position?.name || "-",
        joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('id-ID') : "-",
        avatar: emp.avatar || "",
        probationDaysLeft,
      };
    });

    return ApiResponse.success("Employees fetched successfully", data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ApiResponse.error(errorMessage);
  }
}

export async function createEmployeeAction(data: EmployeeFormData) {
  try {
    const result = await service.registerEmployee(data);
    
    // Get role name for the success message
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    const defaultPass = `${role?.name.toLowerCase() || "user"}123`;

    revalidatePath("/dashboard/employees");
    return ApiResponse.success(`Karyawan berhasil dibuat. Password default: ${defaultPass}`, result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ApiResponse.error(errorMessage);
  }
}

export async function updateEmployeeAction(id: string, data: EmployeeFormData) {
  try {
    const result = await service.updateEmployee(id, data);
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Employee updated successfully", result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ApiResponse.error(errorMessage);
  }
}

export async function promoteEmployeeAction(id: string) {
  try {
    const result = await service.updateEmployee(id, { status: "ACTIVE" });
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Karyawan berhasil dipromosikan menjadi aktif", result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ApiResponse.error(errorMessage);
  }
}

export async function deleteEmployeeAction(id: string) {
  try {
    await service.removeEmployee(id);
    revalidatePath("/dashboard/employees");
    return ApiResponse.success("Employee deleted successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ApiResponse.error(errorMessage);
  }
}

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: { department: true; position: true };
}>;

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true, position: true },
      orderBy: { createdAt: "desc" },
    });
    
    return employees.map((emp: EmployeeWithRelations) => ({
      ...emp,
      nip: emp.nip || "-",
      joinDate: emp.joinDate ? emp.joinDate.toLocaleDateString('id-ID') : "-",
      status: emp.status,
      division: emp.department?.name || "-",
      position: emp.position?.name || "-",
    })) as unknown as Employee[];
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}

export async function getEmployeeById(id: string) {
  try {
    const emp = await prisma.employee.findUnique({
      where: { id },
      include: { department: true, position: true },
    });
    if (!emp) return null;
    return {
      ...emp,
      joinDate: emp.joinDate ? emp.joinDate.toISOString().split("T")[0] : "",
      status: emp.status,
      division: emp.department?.name || "-",
      position: emp.position?.name || "-",
    } as unknown as Employee;
  } catch (error) {
    console.error("Failed to fetch employee by id:", error);
    return null;
  }
}

export async function createEmployee(data: EmployeeFormData) {
  try {
    let finalPositionId = data.positionId;

    // Handle Custom Position
    if (data.positionId === "OTHER" && data.customPosition) {
      const newPos = await prisma.position.upsert({
        where: { name: data.customPosition },
        update: {},
        create: { name: data.customPosition, salaryBase: 0 }
      });
      finalPositionId = newPos.id;
    }

    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        nip: data.nip,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        position: finalPositionId ? { connect: { id: finalPositionId } } : undefined,
        department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
        status: data.status,
        employmentType: data.employmentType,
        joinDate: new Date(data.joinDate),
        avatar: data.avatar,
      },
    });
    revalidatePath("/dashboard/employees");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Failed to create employee:", error);
    return { success: false, error: "Failed to create employee" };
  }
}



export async function updateEmployee(id: string, data: EmployeeFormData) {
  try {
    let finalPositionId = data.positionId;

    // Handle Custom Position
    if (data.positionId === "OTHER" && data.customPosition) {
      const newPos = await prisma.position.upsert({
        where: { name: data.customPosition },
        update: {},
        create: { name: data.customPosition, salaryBase: 0 }
      });
      finalPositionId = newPos.id;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        nip: data.nip,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        position: finalPositionId ? { connect: { id: finalPositionId } } : undefined,
        department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
        status: data.status,
        employmentType: data.employmentType,
        joinDate: new Date(data.joinDate),
      },
    });
    revalidatePath("/dashboard/employees");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Failed to update employee:", error);
    return { success: false, error: "Failed to update employee" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    // Find the employee first to get the userId
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true }
    });

    await prisma.$transaction(async (tx) => {
      // 1. Delete Employee
      await tx.employee.delete({
        where: { id },
      });

      // 2. If there's an associated user, delete it too
      if (employee?.userId) {
        await tx.user.delete({
          where: { id: employee.userId },
        });
      }
    });

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return { success: false, error: "Failed to delete employee" };
  }
}
