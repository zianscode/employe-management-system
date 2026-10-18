import { EmployeeRepository } from "./employee.repository";
import { z } from "zod";

// --- DTO / Validation Schema ---
export const EmployeeSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  nip: z.string().min(5),
  departmentId: z.string(),
  positionId: z.string(),
  roleId: z.string(),
  gender: z.string(),
  birthDate: z.string(),
  employmentType: z.string(),
  status: z.enum(["ACTIVE", "PROBATION", "RESIGNED", "TERMINATED", "LEAVE"]),
  joinDate: z.string(),
  managerId: z.string().optional().nullable(),
  customPosition: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof EmployeeSchema>;

export interface EmployeeFilters {
  departmentId?: string;
  status?: "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED" | "LEAVE";
  search?: string;
}

const repository = new EmployeeRepository();

export class EmployeeService {
  async getAllEmployees(filters?: EmployeeFilters) {
    return await repository.findAll(filters);
  }

  async getEmployeeDetail(id: string) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Employee not found");
    return employee;
  }

  async registerEmployee(data: EmployeeInput) {
    // 1. Validate Input
    EmployeeSchema.parse(data);

    // 2. Check if email exists
    const existing = await repository.findAll({ status: undefined });
    if (existing.some(e => e.email === data.email)) {
      throw new Error("Email already registered");
    }

    // 3. Register
    return await repository.create(data);
  }

  async updateEmployee(id: string, data: Partial<EmployeeInput>) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Employee not found");

    return await repository.update(id, data);
  }

  async removeEmployee(id: string) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Employee not found");

    return await repository.delete(id);
  }
}
