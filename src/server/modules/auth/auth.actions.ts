"use server";

import { ApiResponse } from "@/server/utils/api-response";
import { authService } from "./auth.service";

export async function forgotPasswordAction(email: string) {
  try {
    await authService.requestPasswordReset(email);
    return ApiResponse.success("Jika email terdaftar, instruksi reset password akan dikirim ke email Anda.");
  } catch (error) {
    console.error("Forgot password error:", error);
    return ApiResponse.error("Gagal memproses permintaan reset password.");
  }
}

export async function validateResetTokenAction(token: string) {
  try {
    return ApiResponse.success("Token valid", await authService.validateResetToken(token));
  } catch (error) {
    return ApiResponse.fromError<{ email: string }>(error, "Terjadi kesalahan saat memvalidasi token.");
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    await authService.resetPassword(token, newPassword);
    return ApiResponse.success("Password Anda berhasil diperbarui. Silakan login kembali.");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mereset password.");
  }
}

export async function registerAction(data: { name: string; email: string; password: string }) {
  try {
    await authService.register(data);
    return ApiResponse.success("Registrasi berhasil! Silakan login.");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal melakukan registrasi.");
  }
}

export async function checkUserExistsAction(email: string) {
  try {
    return ApiResponse.success("Check completed", { exists: await authService.userExists(email) });
  } catch (error) {
    return ApiResponse.fromError<{ exists: boolean }>(error, "Gagal mengecek status user.");
  }
}
