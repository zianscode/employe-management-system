import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { assertStrongPassword, hashPassword } from "@/server/utils/password";
import { sendMail } from "@/server/utils/mailer";
import { normalizeEmail } from "@/shared/utils/format";
import { RESET_PASSWORD_SUBJECT, resetPasswordEmail } from "./reset-password.email";

const RESET_TOKEN_VALID_HOURS = 1;
const RESET_TOKEN_BYTES = 32;

class AuthService {
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
    assertStrongPassword(newPassword);
    const resetToken = await this.findValidToken(token);
    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword, mustChangePassword: false, failedLoginAttempts: 0, lockedUntil: null },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    ]);
  }
}

export const authService = new AuthService();
