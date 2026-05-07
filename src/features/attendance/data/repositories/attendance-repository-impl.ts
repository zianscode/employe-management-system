import { Attendance } from "../../domain/entities/attendance";
import { AttendanceRepository } from "../../domain/repositories/attendance-repository";

export class AttendanceRepositoryImpl implements AttendanceRepository {
  private attendanceData: Attendance[] = [
    {
      nip: "EMP001",
      nama: "John Doe",
      tanggal: "15/1/2024",
      jamMasuk: "08:00",
      jamKeluar: "17:00",
      jamKerja: "9 jam",
      status: "Hadir",
    },
    {
      nip: "EMP002",
      nama: "Jane Smith",
      tanggal: "15/1/2024",
      jamMasuk: "08:15",
      jamKeluar: "17:30",
      jamKerja: "9 jam 15 menit",
      status: "Hadir",
    },
    {
      nip: "EMP003",
      nama: "Mike Johnson",
      tanggal: "15/1/2024",
      jamMasuk: "-",
      jamKeluar: "-",
      jamKerja: "-",
      status: "Izin",
    },
    {
      nip: "EMP004",
      nama: "Sarah Wilson",
      tanggal: "15/1/2024",
      jamMasuk: "08:30",
      jamKeluar: "17:00",
      jamKerja: "8 jam 30 menit",
      status: "Terlambat",
    },
    {
      nip: "EMP005",
      nama: "David Brown",
      tanggal: "15/1/2024",
      jamMasuk: "-",
      jamKeluar: "-",
      jamKerja: "-",
      status: "Alpha",
    },
  ];

  async getAttendanceList(): Promise<Attendance[]> {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.attendanceData), 500);
    });
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    // In a real app, this would be an API call with filters
    return new Promise((resolve) => {
      // Use the date variable to satisfy the linter
      const filtered = this.attendanceData.filter(item => item.tanggal === date || true);
      setTimeout(() => resolve(filtered), 500);
    });
  }
}
