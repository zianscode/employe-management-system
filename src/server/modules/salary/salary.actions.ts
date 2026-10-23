"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { notificationService, notifyLater } from "@/server/modules/notification/notification.service";
import { auditService } from "@/server/modules/audit/audit.service";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { SalaryRecord, SalarySlip } from "@/shared/types/salary.types";
import { payrollService } from "./payroll.service";
import { formatPeriod } from "@/shared/utils/date";

export async function getSalariesAction(month: number, year: number) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Data gaji", await payrollService.list(user, month, year));
  } catch (error) {
    return ApiResponse.fromError<SalaryRecord[]>(error, "Gagal mengambil data gaji");
  }
}

export async function generatePayrollAction(month: number, year: number) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    const { processed, skippedPaid } = await auditService.track(
      current,
      { action: "PAYROLL_GENERATED", entity: "PAYROLL_PERIOD", entityId: `${year}-${month}`, targetName: formatPeriod(month, year) },
      () => payrollService.generateMonthly(month, year),
    );
    revalidatePath("/dashboard/salary");
    return ApiResponse.success(
      `Gaji ${processed} karyawan berhasil dihitung` + (skippedPaid ? ` (${skippedPaid} slip sudah dibayar, dilewati)` : "")
    );
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghitung gaji");
  }
}

export async function markSalaryPaidAction(salaryId: string) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    await auditService.track(current, { action: "SALARY_PAID", entity: "SALARY", entityId: salaryId }, () =>
      payrollService.markAsPaid(salaryId),
    );
    notifyLater(() => notificationService.salariesPaid({ id: salaryId }));
    revalidatePath("/dashboard/salary");
    return ApiResponse.success("Slip gaji ditandai sudah dibayar");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui status gaji");
  }
}

export async function markPeriodPaidAction(month: number, year: number) {
  try {
    const current = await requireRole(ADMIN_ROLES);
    const paidSince = new Date();
    const count = await auditService.track(
      current,
      { action: "PAYROLL_PERIOD_PAID", entity: "PAYROLL_PERIOD", entityId: `${year}-${month}`, targetName: formatPeriod(month, year) },
      () => payrollService.markPeriodAsPaid(month, year),
    );
    if (count > 0) {
      notifyLater(() => notificationService.salariesPaid({ periodMonth: month, periodYear: year, paidSince }));
    }
    revalidatePath("/dashboard/salary");
    return ApiResponse.success(count > 0 ? `${count} slip gaji ditandai sudah dibayar` : "Tidak ada slip yang belum dibayar");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal memperbarui status gaji");
  }
}

export async function getSalarySlipAction(salaryId: string) {
  try {
    const user = await requireUser();
    return ApiResponse.success("Slip gaji", await payrollService.getSlip(user, salaryId));
  } catch (error) {
    return ApiResponse.fromError<SalarySlip>(error, "Gagal mengambil slip gaji");
  }
}
