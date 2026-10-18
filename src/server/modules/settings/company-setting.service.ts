import { prisma } from "@/server/db/prisma";
import { z } from "zod";

const SETTING_ID = "default";
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

export const CompanySettingSchema = z
  .object({
    companyName: z.string().trim().min(1, "Nama perusahaan wajib diisi"),
    companyCode: z.string().trim().nullable().optional(),
    npwp: z.string().trim().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    workStartTime: z.string().regex(TIME_FORMAT, "Format jam masuk HH:mm"),
    workEndTime: z.string().regex(TIME_FORMAT, "Format jam pulang HH:mm"),
    lateToleranceMinutes: z.coerce.number().int().min(0).max(240),
    overtimeRatePerHour: z.coerce.number().int().min(0),
    workingDaysPerMonth: z.coerce.number().int().min(1).max(31),
    annualLeaveQuota: z.coerce.number().int().min(0).max(365),
  })
  .refine((s) => s.workEndTime > s.workStartTime, {
    message: "Jam pulang harus setelah jam masuk",
    path: ["workEndTime"],
  });

export type CompanySettingInput = z.infer<typeof CompanySettingSchema>;

export class CompanySettingService {
  /** Selalu mengembalikan pengaturan; baris default dibuat otomatis jika belum ada. */
  async get() {
    return prisma.companySetting.upsert({
      where: { id: SETTING_ID },
      update: {},
      create: { id: SETTING_ID },
    });
  }

  async update(input: CompanySettingInput) {
    const data = CompanySettingSchema.parse(input);
    return prisma.companySetting.upsert({
      where: { id: SETTING_ID },
      update: data,
      create: { id: SETTING_ID, ...data },
    });
  }
}

export const companySettingService = new CompanySettingService();
