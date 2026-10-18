"use server";

import { requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ProfileData, PasswordData } from "@/shared/types/profile.types";
import { profileService } from "./profile.service";

export async function getProfileAction() {
  try {
    const user = await requireUser();
    return ApiResponse.success("Profile fetched", await profileService.getProfile(user.userId));
  } catch (error) {
    return ApiResponse.fromError<ProfileData>(error, "Gagal mengambil profil");
  }
}

export async function updateProfileAction(data: ProfileData) {
  try {
    const user = await requireUser();
    await profileService.updateProfile(user.userId, data);
    return ApiResponse.success("Profil berhasil diperbarui");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui profil");
  }
}

export async function updatePasswordAction(data: PasswordData) {
  try {
    const user = await requireUser();
    await profileService.updatePassword(user.userId, data);
    return ApiResponse.success("Password berhasil diperbarui");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui password");
  }
}
