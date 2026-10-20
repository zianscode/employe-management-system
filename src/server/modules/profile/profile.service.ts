import { prisma } from "@/server/db/prisma";
import { assertStrongPassword, hashPassword, verifyPassword } from "@/server/utils/password";
import { isDataUrlImage, saveAvatar } from "@/server/utils/avatar-storage";
import { ProfileData, PasswordData } from "@/shared/types/profile.types";
import { dateToDateKey } from "@/shared/utils/date";
import { normalizeEmail } from "@/shared/utils/format";

class ProfileService {
  async getProfile(userId: string): Promise<ProfileData> {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { department: true, position: true },
    });
    if (!employee) throw new Error("Profil karyawan tidak ditemukan");

    return {
      namaLengkap: employee.name,
      email: employee.email,
      nomorTelepon: employee.phone || "",
      tanggalLahir: employee.birthDate ? dateToDateKey(employee.birthDate) : "",
      alamat: employee.address || "",
      idKaryawan: employee.nip || "-",
      departemen: employee.department?.name || "-",
      jabatan: employee.position?.name || "-",
      tanggalBergabung: employee.joinDate ? dateToDateKey(employee.joinDate) : "-",
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
    const email = normalizeEmail(data.email);
    const emailTaken = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
    if (emailTaken) throw new Error("Email sudah dipakai akun lain");

    const avatar = isDataUrlImage(data.avatar) ? await saveAvatar(userId, data.avatar) : data.avatar;

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: { userId },
        data: {
          name: data.namaLengkap,
          email,
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
          avatar,
        },
      });
      await tx.user.update({ where: { id: userId }, data: { email } });
      return employee;
    });
  }

  async updatePassword(userId: string, data: PasswordData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Pengguna tidak ditemukan");

    const isMatch = await verifyPassword(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Password saat ini yang Anda masukkan salah");
    if (data.newPassword !== data.confirmPassword) throw new Error("Konfirmasi password tidak sama");
    if (data.newPassword === data.currentPassword) throw new Error("Password baru harus berbeda dari password saat ini");
    assertStrongPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(data.newPassword), mustChangePassword: false },
    });
  }
}

export const profileService = new ProfileService();
