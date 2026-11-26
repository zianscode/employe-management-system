import { browserTransport } from "./transport";
import { hrAPI } from "./hr";
import { attendanceLeaveAPI } from "./attendance-leave";
import { payrollReportsAPI } from "./payroll-reports";

export const {
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
  promoteEmployee, getRoles, getUsers, resetUserPassword, unlockUser,
  getOrgData, saveDepartment, deleteDepartment, savePosition, deletePosition,
  getCompanySetting, updateCompanySetting, getHolidays, createHoliday, deleteHoliday,
  getProfile, updateProfile, updatePassword, completeOnboarding, forgotPassword,
  validateResetToken, resetPassword,
} = hrAPI(browserTransport);

export const {
  clockIn, clockOut, getMyTodayAttendance, getDailyAttendance,
  getAttendanceCorrections, submitAttendanceCorrection, approveAttendanceCorrection,
  rejectAttendanceCorrection, cancelAttendanceCorrection, getLeaveRequests,
  getLeavePreview, getEmployeesForLeave, createLeaveRequest,
  approveLeave, rejectLeave, cancelLeave, getAuditLogs, getPendingApprovals,
} = attendanceLeaveAPI(browserTransport);

export const {
  getSalaries, generatePayroll, markPeriodPaid, markSalaryPaid, getPayrollComponents,
  addPayrollComponent, deletePayrollComponent, getAttendanceReport, getSalaryReport,
  getEmployeeReport, getLeaveReport,
} = payrollReportsAPI(browserTransport);
