"use server";

import { prisma } from "@/server/db/prisma";
import { EmploymentType } from "@prisma/client";
import { auth } from "@/server/auth/auth";
import { ApiResponse } from "@/server/utils/api-response";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

import { getDepartmentForPosition } from "@/shared/utils/position-department";

export async function completeOnboardingAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return ApiResponse.error("Unauthorized");

    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const gender = formData.get("gender") as string;
    const birthDate = formData.get("birthDate") as string;
    const placeOfBirth = formData.get("placeOfBirth") as string;
    const identityNumber = formData.get("identityNumber") as string;
    const bankName = formData.get("bankName") as string;
    const bankAccount = formData.get("bankAccount") as string;
    const bankHolderName = formData.get("bankHolderName") as string;
    const npwpNumber = formData.get("npwpNumber") as string;
    const emergencyName = formData.get("emergencyName") as string;
    const emergencyPhone = formData.get("emergencyPhone") as string;
    const emergencyRelation = formData.get("emergencyRelation") as string;
    const bio = formData.get("bio") as string;
    const education = formData.get("education") as string;
    const skills = formData.get("skills") as string;
    const avatar = formData.get("avatar") as string;
    
    const positionName = formData.get("positionName") as string;
    const customPosition = formData.get("customPosition") as string;
    const employmentType = formData.get("employmentType") as string;

    let resolvedPositionName = positionName;
    if (positionName === "other") {
      resolvedPositionName = customPosition ? customPosition.trim() : "Other";
    }

    const resolvedDepartmentName = getDepartmentForPosition(resolvedPositionName);

    let dbPosition = await prisma.position.findFirst({
      where: { name: { equals: resolvedPositionName, mode: "insensitive" } }
    });
    if (!dbPosition) {
      dbPosition = await prisma.position.create({
        data: { name: resolvedPositionName, salaryBase: 0 }
      });
    }

    let dbDepartment = await prisma.department.findFirst({
      where: { name: { equals: resolvedDepartmentName, mode: "insensitive" } }
    });
    if (!dbDepartment) {
      dbDepartment = await prisma.department.create({
        data: { name: resolvedDepartmentName, description: `Departemen otomatis untuk divisi ${resolvedDepartmentName}` }
      });
    }

    const existing = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      select: { positionId: true, departmentId: true, salaryBase: true },
    });
    const positionId = existing?.positionId || dbPosition.id;
    const departmentId = existing?.departmentId || dbDepartment.id;
    const position = await prisma.position.findUnique({ where: { id: positionId }, select: { salaryBase: true } });
    const salaryBase = existing?.salaryBase || position?.salaryBase || 0;

    let avatarUrl = avatar;

    if (avatar && avatar.startsWith("data:image")) {
      const base64Data = avatar.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `avatar-${session.user.id}-${Date.now()}.jpg`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      avatarUrl = `/uploads/avatars/${fileName}`;
    }

    await prisma.employee.upsert({
      where: { userId: session.user.id },
      update: {
        avatar: avatarUrl,
        phone,
        address,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        placeOfBirth,
        identityNumber,
        bankName,
        bankAccount,
        bankHolderName,
        npwpNumber,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        bio,
        education,
        skills,
        positionId,
        departmentId,
        salaryBase,
        employmentType: (employmentType as EmploymentType) || "FULL_TIME",
        isProfileComplete: true,
        onboardedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        name: session.user.name || "Karyawan Baru",
        email: session.user.email || "",
        avatar: avatarUrl,
        phone,
        address,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        placeOfBirth,
        identityNumber,
        bankName,
        bankAccount,
        bankHolderName,
        npwpNumber,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        bio,
        education,
        skills,
        positionId,
        departmentId,
        salaryBase,
        employmentType: (employmentType as EmploymentType) || "FULL_TIME",
        isProfileComplete: true,
        onboardedAt: new Date(),
      }
    });

    revalidatePath("/");
    return ApiResponse.success("Onboarding berhasil diselesaikan!", { avatar: avatarUrl });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return ApiResponse.error("Gagal menyimpan data onboarding.");
  }
}
