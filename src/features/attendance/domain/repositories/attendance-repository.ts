import { Attendance } from "../entities/attendance";

export interface AttendanceRepository {
  getAttendanceList(): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
}
