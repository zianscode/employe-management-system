import crypto from "crypto";
import { EmployeeStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/utils/password";
import { sendMail } from "@/server/utils/mailer";
import { companySettingService } from "@/server/modules/settings/company-setting.service";
import { ROLES } from "@/shared/constants/roles";
import { normalizeEmail } from "@/shared/utils/format";
import { RESET_PASSWORD_SUBJECT, resetPasswordEmail } from "./reset-password.email";

const RESET_TOKEN_VALID_HOURS = 1;
const RESET_TOKEN_BYTES = 32;
const MIN_PASSWORD_LENGTH = 6;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  async userExists(email: string) {
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    return !!user;
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (!user) return;

    const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_VALID_HOURS * 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { token, expires, userId: user.id } });

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: RESET_PASSWORD_SUBJECT,
      html: resetPasswordEmail(resetLink, RESET_TOKEN_VALID_HOURS),
    });
  }

  private async findValidToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token }, include: { user: true } });
    if (!resetToken || resetToken.expires < new Date()) {
      throw new Error("Token tidak valid atau sudah kadaluwarsa.");
    }
    return resetToken;
  }

  async validateResetToken(token: string) {
    const resetToken = await this.findValidToken(token);
    return { email: resetToken.user.email };
  }

  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
    }
    const resetToken = await this.findValidToken(token);
    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    ]);
  }

  async register({ name, email, password }: RegisterInput) {
    const normalizedEmail = normalizeEmail(email);
    if (await this.userExists(normalizedEmail)) throw new Error("Email sudah terdaftar.");

    const employeeRole = await prisma.role.findUnique({ where: { name: ROLES.EMPLOYEE } });
    if (!employeeRole) throw new Error("Konfigurasi sistem (Role) belum lengkap.");

    const [hashedPassword, setting] = await Promise.all([hashPassword(password), companySettingService.get()]);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: normalizedEmail, password: hashedPassword, roleId: employeeRole.id },
      });
      await tx.employee.create({
        data: {
          name,
          email: normalizedEmail,
          userId: user.id,
          status: EmployeeStatus.PROBATION,
          joinDate: new Date(),
          leaveQuota: setting.annualLeaveQuota,
          isProfileComplete: false,
        },
      });
    });
  }
}

export const authService = new AuthService();
