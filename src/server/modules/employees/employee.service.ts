import { EmployeeRepository } from "./employee.repository";
import { EmployeeFormData } from "@/shared/types/employee.types";
import { EmployeeStatus } from "@prisma/client";
import { z } from "zod";

// --- Validasi input form karyawan ---
export const EmployeeSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
  departmentId: z.string(),
  positionId: z.string(),
  roleId: z.string().min(1, "Role wajib dipilih"),
  gender: z.string(),
  birthDate: z.string(),
  employmentType: z.string(),
  status: z.nativeEnum(EmployeeStatus),
  joinDate: z.string(),
  managerId: z.string().optional().nullable(),
  customPosition: z.string().optional(),
  salaryBase: z.coerce.number().min(0).optional(),
});

export interface EmployeeFilters {
  departmentId?: string;
  status?: EmployeeStatus;
}

const repository = new EmployeeRepository();

export class EmployeeService {
  async getAllEmployees(filters?: EmployeeFilters) {
    return repository.findAll(filters);
  }

  async getEmployeeDetail(id: string) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Karyawan tidak ditemukan");
    return employee;
  }

  async registerEmployee(data: EmployeeFormData) {
    EmployeeSchema.parse(data);

    const email = data.email.toLowerCase().trim();
    if (await repository.emailExists(email)) throw new Error("Email sudah terdaftar");

    const nip = await repository.resolveUniqueNip(data.nip);
    return repository.create({ ...data, email, nip });
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormData>) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Karyawan tidak ditemukan");

    if (data.email) {
      const email = data.email.toLowerCase().trim();
      if (await repository.emailExists(email, id)) throw new Error("Email sudah dipakai karyawan/akun lain");
    }
    if (data.nip && data.nip !== employee.nip) {
      data = { ...data, nip: await repository.resolveUniqueNip(data.nip, id) };
    }
    if (data.managerId && data.managerId === id) throw new Error("Karyawan tidak bisa menjadi atasan dirinya sendiri");

    return repository.update(id, data);
  }

  /**
   * Karyawan yang sudah punya riwayat absensi/cuti/gaji tidak boleh dihapus permanen,
   * karena riwayat tersebut wajib disimpan. Ubah statusnya menjadi RESIGNED / TERMINATED.
   */
  async removeEmployee(id: string, currentUserId: string) {
    const employee = await repository.findById(id);
    if (!employee) throw new Error("Karyawan tidak ditemukan");
    if (employee.userId === currentUserId) throw new Error("Anda tidak dapat menghapus data Anda sendiri");

    if ((await repository.countHistory(id)) > 0) {
      throw new Error(
        "Karyawan ini sudah memiliki riwayat absensi/cuti/gaji sehingga tidak bisa dihapus. Ubah statusnya menjadi Resign atau Diberhentikan."
      );
    }

    return repository.delete(id);
  }
}
