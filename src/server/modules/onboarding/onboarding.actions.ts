"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireEmployee } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { isDataUrlImage, saveAvatar } from "@/server/utils/avatar-storage";

const PERSONAL_FIELDS = [
  "phone",
  "address",
  "gender",
  "placeOfBirth",
  "identityNumber",
  "bankName",
  "bankAccount",
  "bankHolderName",
  "npwpNumber",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
  "bio",
  "education",
  "skills",
] as const;

type PersonalField = (typeof PERSONAL_FIELDS)[number];

export async function completeOnboardingAction(formData: FormData) {
  try {
    const user = await requireEmployee();

    const personal = Object.fromEntries(
      PERSONAL_FIELDS.map((field) => [field, (formData.get(field) as string | null) || null])
    ) as Record<PersonalField, string | null>;

    const birthDate = formData.get("birthDate") as string | null;
    const avatarInput = formData.get("avatar") as string | null;
    const avatar = isDataUrlImage(avatarInput) ? await saveAvatar(user.userId, avatarInput) : avatarInput || undefined;

    await prisma.employee.update({
      where: { id: user.employeeId },
      data: {
        ...personal,
        avatar,
        birthDate: birthDate ? new Date(birthDate) : null,
        isProfileComplete: true,
        onboardedAt: new Date(),
      },
    });

    revalidatePath("/");
    return ApiResponse.success("Onboarding berhasil diselesaikan!", { avatar: avatar ?? null });
  } catch (error) {
    console.error("Onboarding error:", error);
    return ApiResponse.fromError<{ avatar: string | null }>(error, "Gagal menyimpan data onboarding.");
  }
}
