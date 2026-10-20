"use server";

import { requireRole, requireUser } from "@/server/auth/guard";
import { ApiResponse } from "@/server/utils/api-response";
import { ADMIN_ROLES, APPROVER_ROLES, isAdminRole } from "@/shared/constants/roles";
import {
  AttendanceReportData,
  EmployeeReportData,
  LeaveReportData,
  SalaryReportData,
} from "@/shared/types/report.types";
import { reportService } from "./report.service";

function assertPeriod(month: number, year: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    throw new Error("Periode laporan tidak valid");
  }
}

export async function getSalaryTrendAction() {
  try {
    const user = await requireUser();
    const employeeId = isAdminRole(user.role) ? undefined : user.employeeId ?? "__none__";
    return ApiResponse.success("Salary trend fetched", await reportService.getSalaryTrend(employeeId));
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil tren gaji");
  }
}

export async function getDeptDistributionAction() {
  try {
    await requireRole(APPROVER_ROLES);
    return ApiResponse.success("Department distribution fetched", await reportService.getDepartmentDistribution());
  } catch (error) {
    return ApiResponse.fromError(error, "Gagal mengambil distribusi departemen");
  }
}

export async function getAttendanceReportAction(month: number, year: number) {
  try {
    const user = await requireRole(APPROVER_ROLES);
    assertPeriod(month, year);
    return ApiResponse.success("Laporan absensi", await reportService.getAttendanceReport(user, month, year));
  } catch (error) {
    return ApiResponse.fromError<AttendanceReportData>(error, "Gagal mengambil laporan absensi");
  }
}

export async function getSalaryReportAction(month: number, year: number) {
  try {
    await requireRole(ADMIN_ROLES);
    assertPeriod(month, year);
    return ApiResponse.success("Laporan gaji", await reportService.getSalaryReport(month, year));
  } catch (error) {
    return ApiResponse.fromError<SalaryReportData>(error, "Gagal mengambil laporan gaji");
  }
}

export async function getEmployeeReportAction(month: number, year: number) {
  try {
    const user = await requireRole(APPROVER_ROLES);
    assertPeriod(month, year);
    return ApiResponse.success("Laporan karyawan", await reportService.getEmployeeReport(user, month, year));
  } catch (error) {
    return ApiResponse.fromError<EmployeeReportData>(error, "Gagal mengambil laporan karyawan");
  }
}

export async function getLeaveReportAction(month: number, year: number) {
  try {
    const user = await requireRole(APPROVER_ROLES);
    assertPeriod(month, year);
    return ApiResponse.success("Laporan cuti", await reportService.getLeaveReport(user, month, year));
  } catch (error) {
    return ApiResponse.fromError<LeaveReportData>(error, "Gagal mengambil laporan cuti");
  }
}
