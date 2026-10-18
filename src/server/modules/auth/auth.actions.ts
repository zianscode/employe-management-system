"use server";

import { prisma } from "@/server/db/prisma";
import { ApiResponse } from "@/server/utils/api-response";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function forgotPasswordAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Forgot Password: User not found for email ${email}`);
      // For security reasons, don't reveal if user exists
      return ApiResponse.success("Jika email terdaftar, instruksi reset akan dikirim.");
    }

    console.log(`Forgot Password: User found, generating token for ${email}`);

    // Generate Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save to DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id,
      },
    });

    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"EMS Pro Support" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Reset Password Akun EMS Pro Anda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Halo,</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Kami menerima permintaan untuk mereset password akun Anda di <strong>EMS Pro</strong>.</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Silakan klik tombol di bawah ini untuk membuat password baru. Link ini hanya berlaku selama 1 jam.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #E02F75; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Sekarang</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">Atau copy link berikut ke browser Anda:</p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">${resetLink}</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Akun Anda tetap aman.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return ApiResponse.success("Instruksi reset password telah berhasil dikirim ke email Anda.");
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return ApiResponse.error("Gagal memproses permintaan reset password.");
  }
}

export async function validateResetTokenAction(token: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return ApiResponse.error("Token tidak valid atau sudah kadaluwarsa.");
    }

    return ApiResponse.success("Token valid", { email: resetToken.user.email });
  } catch {
    return ApiResponse.error("Terjadi kesalahan saat memvalidasi token.");
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return ApiResponse.error("Token tidak valid atau sudah kadaluwarsa.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return ApiResponse.success("Password Anda berhasil diperbarui. Silakan login kembali.");
  } catch {
    return ApiResponse.error("Gagal mereset password.");
  }
}

export async function registerAction(data: { name: string, email: string, password: string }) {
  try {
    const normalizedEmail = data.email.toLowerCase().trim();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return ApiResponse.error("Email sudah terdaftar.");

    // Find default role
    const employeeRole = await prisma.role.findUnique({ where: { name: "EMPLOYEE" } });
    if (!employeeRole) return ApiResponse.error("Konfigurasi sistem (Role) belum lengkap.");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create in Transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          roleId: employeeRole.id,
        }
      });

      // Create Employee Profile (Minimal)
      await tx.employee.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          userId: user.id,
          status: "PROBATION",
          joinDate: new Date(),
          isProfileComplete: false,
        }
      });
    });

    return ApiResponse.success("Registrasi berhasil! Silakan login.");
  } catch (error) {
    console.error("Register Error:", error);
    return ApiResponse.error("Gagal melakukan registrasi.");
  }
}

export async function checkUserExistsAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return ApiResponse.success("Check completed", { exists: !!user });
  } catch {
    return ApiResponse.error("Gagal mengecek status user.");
  }
}
