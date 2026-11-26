import { cookies } from "next/headers";
import { backendTransport, SESSION_COOKIE } from "./backend";
import type { Transport } from "./transport";
import { hrAPI } from "./hr";
import { attendanceLeaveAPI } from "./attendance-leave";
import { payrollReportsAPI } from "./payroll-reports";

const sessionToken = async () => (await cookies()).get(SESSION_COOKIE)?.value;
const serverTransport: Transport = async (path, init) => backendTransport(await sessionToken())(path, init);

export const {
  getEmployees, getEmployeeById, getEmployeeHistory, getOrganization, getUpcomingHolidays,
} = hrAPI(serverTransport);

export const {
  getAttendanceStats, getLeaveStats, getMyLeaveBalance, getPendingApprovals,
} = attendanceLeaveAPI(serverTransport);

export const { getSalarySlip, getDashboardStats, getMyOverview, getSalaryTrend, getDeptDistribution } =
  payrollReportsAPI(serverTransport);
