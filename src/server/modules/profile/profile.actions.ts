"use server";

import { auth } from "@/server/auth/auth";
import { ProfileService } from "./profile.service";
import { ApiResponse } from "@/server/utils/api-response";
import { ProfileData, PasswordData, UserPreferences } from "@/shared/types/profile.types";

const service = new ProfileService();

export async function getProfileAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponse.error("Unauthorized");
    }

    const data = await service.getProfile(session.user.id);
    return ApiResponse.success("Profile fetched", data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gagal mengambil profil";
    return ApiResponse.error(errorMessage);
  }
}

export async function updateProfileAction(data: ProfileData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return ApiResponse.error("Unauthorized");

    await service.updateProfile(session.user.id, data);
    return ApiResponse.success("Profil berhasil diperbarui");
  } catch (error) {
    return ApiResponse.error(error instanceof Error ? error.message : "Gagal memperbarui profil");
  }
}

export async function updatePasswordAction(data: PasswordData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return ApiResponse.error("Unauthorized");

    await service.updatePassword(session.user.id, data);
    return ApiResponse.success("Password berhasil diperbarui");
  } catch (error) {
    return ApiResponse.error(error instanceof Error ? error.message : "Gagal memperbarui password");
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updatePreferencesAction(data: UserPreferences) {
  try {
    // For now, just return success as a placeholder
    return ApiResponse.success("Preferensi disimpan");
  } catch {
    return ApiResponse.error("Gagal menyimpan preferensi");
  }
}
