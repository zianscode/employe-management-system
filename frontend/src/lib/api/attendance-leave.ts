import type { PendingApprovals } from "@/shared/types/approval.types";
import type {
  Attendance, AttendanceCorrectionInput, AttendanceCorrectionRow, MyTodayAttendance,
} from "@/shared/types/attendance.types";
import type { AuditLogRow } from "@/shared/types/audit.types";
import type { LeaveBalance, LeavePreview, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import { request, type Transport } from "./transport";
import type { components } from "./schema";

type StatData = components["schemas"]["WorkStat"];

export function attendanceLeaveAPI(transport: Transport) {
  const rest = <T>(path: string, method = "GET", body?: unknown) => request<T>(transport, path, method, body);
  const leave = "/leave-requests";
  const corrections = "/attendance-corrections";
  const decide = (path: string, id: string, action: string, body?: unknown) =>
    rest(`${path}/${encodeURIComponent(id)}/${action}`, "POST", body);

  return {
    clockIn: () => rest("/attendance/check-in", "POST"),
    clockOut: () => rest("/attendance/check-out", "POST"),
    getMyTodayAttendance: () => rest<MyTodayAttendance>("/attendance/me/today"),
    getDailyAttendance: (date: string) => rest<Attendance[]>(`/attendance/daily?date=${encodeURIComponent(date)}`),
    getAttendanceStats: () => rest<StatData[]>("/attendance/stats"),
    getAttendanceCorrections: () => rest<AttendanceCorrectionRow[]>(corrections),
    submitAttendanceCorrection: (input: AttendanceCorrectionInput) => rest(corrections, "POST", input),
    approveAttendanceCorrection: (id: string) => decide(corrections, id, "approve"),
    rejectAttendanceCorrection: (id: string, reason: string) => decide(corrections, id, "reject", { reason }),
    cancelAttendanceCorrection: (id: string) => decide(corrections, id, "cancel"),
    getLeaveRequests: () => rest<LeaveRequest[]>(leave),
    getLeaveStats: () => rest<StatData[]>(`${leave}/stats`),
    getMyLeaveBalance: () => rest<LeaveBalance>(`${leave}/me/balance`),
    getLeavePreview: (input: { employeeId?: string; startDate: string; endDate?: string }) =>
      rest<LeavePreview>(`${leave}/preview`, "POST", input),
    getEmployeesForLeave: () => rest<{ id: string; name: string; nip: string }[]>(`${leave}/employee-options`),
    createLeaveRequest: (input: LeaveRequestInput) => rest(leave, "POST", input),
    approveLeave: (id: string) => decide(leave, id, "approve"),
    rejectLeave: (id: string, reason: string) => decide(leave, id, "reject", { reason }),
    cancelLeave: (id: string) => decide(leave, id, "cancel"),
    getAuditLogs: () => rest<AuditLogRow[]>("/audit-logs"),
    getPendingApprovals: () => rest<PendingApprovals>("/dashboard/pending-approvals"),
  };
}
