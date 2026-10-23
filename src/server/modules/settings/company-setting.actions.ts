"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { auditService } from "@/server/modules/audit/audit.service";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { CompanySetting } from "@/shared/types/settings.types";
import { companySettingService, CompanySettingInput } from "./company-setting.service";

export async function getCompanySettingAction() {
  try {
    await requireRole(ADMIN_ROLES);
    const s = await companySettingService.get();
    const setting: CompanySetting = {
      id: s.id,
      companyName: s.companyName,
      companyCode: s.companyCode,
      npwp: s.npwp,
      phone: s.phone,
      workStartTime: s.workStartTime,
      workEndTime: s.workEndTime,
      lateToleranceMinutes: s.lateToleranceMinutes,
      overtimeRatePerHour: s.overtimeRatePerHour,
      workingDaysPerMonth: s.workingDaysPerMonth,
      annualLeaveQuota: s.annualLeaveQuota,
      bpjsKesehatanWageCap: s.bpjsKesehatanWageCap,
      jpWageCap: s.jpWageCap,
      jkkRateBps: s.jkkRateBps,
      bpjsMinimumWage: s.bpjsMinimumWage,
    };
    return ApiResponse.success("Pengaturan perusahaan", setting);
  } catch (error) {
    return ApiResponse.fromError<CompanySetting>(error, "Gagal mengambil pengaturan perusahaan");
  }
}

export async function updateCompanySettingAction(input: CompanySettingInput) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "COMPANY_SETTING_UPDATED", entity: "COMPANY_SETTING" }, () =>
      companySettingService.update(input),
    );
    revalidatePath("/dashboard", "layout");
    return ApiResponse.success("Pengaturan perusahaan disimpan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menyimpan pengaturan perusahaan");
  }
}
