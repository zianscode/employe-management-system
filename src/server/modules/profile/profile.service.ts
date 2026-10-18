import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import { ProfileData, PasswordData } from "@/shared/types/profile.types";

export class ProfileService {
  async getProfile(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) throw new Error("Employee profile not found");

    return {
      namaLengkap: employee.name,
      email: employee.email,
      nomorTelepon: employee.phone || "",
      tanggalLahir: employee.birthDate ? employee.birthDate.toISOString().split("T")[0] : "",
      alamat: employee.address || "",
      idKaryawan: employee.nip || "-",
      departemen: employee.department?.name || "-",
      jabatan: employee.position?.name || "-",
      tanggalBergabung: employee.joinDate ? employee.joinDate.toISOString().split("T")[0] : "-",
      tempatLahir: employee.placeOfBirth || "",
      jenisKelamin: employee.gender || "",
      nik: employee.identityNumber || "",
      npwp: employee.npwpNumber || "",
      bankName: employee.bankName || "",
      bankAccount: employee.bankAccount || "",
      bankHolderName: employee.bankHolderName || "",
      emergencyName: employee.emergencyName || "",
      emergencyPhone: employee.emergencyPhone || "",
      emergencyRelation: employee.emergencyRelation || "",
      education: employee.education || "",
      skills: employee.skills || "",
      bio: employee.bio || "",
      avatar: employee.avatar || "",
    };
  }

  async updateProfile(userId: string, data: ProfileData) {
    // Start a transaction to ensure both are updated
    return await prisma.$transaction(async (tx) => {
      // 1. Update Employee
      const employee = await tx.employee.update({
        where: { userId },
        data: {
          name: data.namaLengkap,
          email: data.email,
          phone: data.nomorTelepon,
          address: data.alamat,
          birthDate: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
          placeOfBirth: data.tempatLahir,
          gender: data.jenisKelamin,
          identityNumber: data.nik,
          npwpNumber: data.npwp,
          bankName: data.bankName,
          bankAccount: data.bankAccount,
          bankHolderName: data.bankHolderName,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          emergencyRelation: data.emergencyRelation,
          education: data.education,
          skills: data.skills,
          bio: data.bio,
          avatar: data.avatar,
        },
      });

      // 2. Also update the User record email
      await tx.user.update({
        where: { id: userId },
        data: { email: data.email },
      });

      return employee;
    });
  }

  async updatePassword(userId: string, data: PasswordData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.password) throw new Error("Pengguna tidak ditemukan");

    // Verify current password
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Password saat ini yang Anda masukkan salah");

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    // Update to DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (!updatedUser) throw new Error("Gagal menyimpan password baru ke database");
    
    return updatedUser;
  }
}
