"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { HolidayRow } from "@/shared/types/settings.types";
import { HolidayInput, holidayService } from "./holiday.service";

export async function getHolidaysAction(year: number) {
  try {
    await requireRole(ADMIN_ROLES);
    return ApiResponse.success("Hari libur", await holidayService.list(year));
  } catch (error) {
    return ApiResponse.fromError<HolidayRow[]>(error, "Gagal mengambil hari libur");
  }
}

export async function getUpcomingHolidaysAction(limit = 5) {
  try {
    await requireUser();
    return ApiResponse.success("Hari libur mendatang", await holidayService.upcoming(Math.min(Math.max(limit, 1), 20)));
  } catch (error) {
    return ApiResponse.fromError<HolidayRow[]>(error, "Gagal mengambil hari libur");
  }
}

export async function createHolidayAction(input: HolidayInput) {
  try {
    await requireRole(ADMIN_ROLES);
    await holidayService.create(input);
    revalidatePath("/dashboard", "layout");
    return ApiResponse.success("Hari libur ditambahkan");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menambah hari libur");
  }
}

export async function deleteHolidayAction(id: string) {
  try {
    await requireRole(ADMIN_ROLES);
    await holidayService.remove(id);
    revalidatePath("/dashboard", "layout");
    return ApiResponse.success("Hari libur dihapus");
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal menghapus hari libur");
  }
}
