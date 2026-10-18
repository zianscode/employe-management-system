import { useState, useMemo } from "react";
import { ReportTabId, AttendanceTrend, AttendanceDistribution, ReportStat } from "@/shared/types/report.types";
import { Clock, DollarSign, Users, Calendar, TrendingUp, BarChart3 } from "lucide-react";

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTabId>("absensi");
  const [selectedMonth, setSelectedMonth] = useState("Januari 2024");

  const attendanceData: AttendanceTrend[] = [];

  const attendancePieData: AttendanceDistribution[] = [
    { name: "Hadir", value: 0, color: "#10B981" },
    { name: "Izin", value: 0, color: "#3B82F6" },
    { name: "Sakit", value: 0, color: "#F59E0B" },
    { name: "Alpha", value: 0, color: "#EF4444" },
  ];

  interface SalaryTrend {
    month: string;
    totalGaji: number;
    rataRata: number;
    bonus: number;
  }

  const salaryData: SalaryTrend[] = [];

  const stats: ReportStat[] = useMemo(() => {
    switch (activeTab) {
      case "absensi":
        return [
          { title: "Rata-rata Kehadiran", value: "0%", change: "0%", icon: TrendingUp, color: "from-green-400 to-green-600", bgColor: "bg-green-50" },
          { title: "Total Izin", value: "0", change: "0", icon: Calendar, color: "from-blue-400 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Total Sakit", value: "0", change: "0", icon: Clock, color: "from-orange-400 to-orange-600", bgColor: "bg-orange-50" },
          { title: "Total Alpha", value: "0", change: "0", icon: Users, color: "from-red-400 to-red-600", bgColor: "bg-red-50" },
        ];
      case "gaji":
        return [
          { title: "Total Pengeluaran Gaji", value: "Rp 0", change: "0%", icon: DollarSign, color: "from-blue-400 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Rata-rata Gaji", value: "Rp 0", change: "0%", icon: TrendingUp, color: "from-green-400 to-green-600", bgColor: "bg-green-50" },
          { title: "Kenaikan YoY", value: "0%", change: "0%", icon: BarChart3, color: "from-purple-400 to-purple-600", bgColor: "bg-purple-50" },
          { title: "Total Bonus", value: "Rp 0", change: "0%", icon: DollarSign, color: "from-orange-400 to-orange-600", bgColor: "bg-orange-50" },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
    stats,
    attendanceData,
    attendancePieData,
    salaryData,
    selectedMonth,
    setSelectedMonth,
  };
}
