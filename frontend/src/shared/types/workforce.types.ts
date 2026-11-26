import type { components } from "@/lib/api/schema";
import type { PtkpValue } from "@/shared/constants/payroll";

export type EmployeeStatus = "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE" | "FREELANCE";
export type PtkpStatus = PtkpValue;
export type DailyAttendanceStatus = components["schemas"]["DailyAttendance"]["status"];
export type LeaveStatus = components["schemas"]["LeaveRequest"]["status"];
export type LeaveType = components["schemas"]["LeaveRequest"]["tipeCuti"];
