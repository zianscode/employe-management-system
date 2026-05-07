import { useState, useMemo } from "react";
import { ReportTabId, AttendanceTrend, AttendanceDistribution, ReportStat } from "../../domain/entities/report";
import { Clock, DollarSign, Users, Calendar, TrendingUp, BarChart3 } from "lucide-react";

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTabId>("absensi");

  const attendanceData: AttendanceTrend[] = [
    { month: "Jan", kehadiran: 92, izin: 5, sakit: 2, alpha: 1 },
    { month: "Feb", kehadiran: 88, izin: 8, sakit: 3, alpha: 1 },
    { month: "Mar", kehadiran: 95, izin: 3, sakit: 1, alpha: 1 },
    { month: "Apr", kehadiran: 90, izin: 6, sakit: 3, alpha: 1 },
    { month: "May", kehadiran: 93, izin: 4, sakit: 2, alpha: 1 },
    { month: "Jun", kehadiran: 91, izin: 5, sakit: 3, alpha: 1 },
  ];

  const attendancePieData: AttendanceDistribution[] = [
    { name: "Hadir", value: 91.3, color: "#10B981" },
    { name: "Izin", value: 5.2, color: "#3B82F6" },
    { name: "Sakit", value: 2.8, color: "#F59E0B" },
    { name: "Alpha", value: 0.7, color: "#EF4444" },
  ];

  const salaryData = [
    { month: "Jan", totalGaji: 900000000, rataRata: 9000000, bonus: 50000000 },
    { month: "Feb", totalGaji: 920000000, rataRata: 9200000, bonus: 45000000 },
    { month: "Mar", totalGaji: 880000000, rataRata: 8800000, bonus: 60000000 },
    { month: "Apr", totalGaji: 950000000, rataRata: 9500000, bonus: 55000000 },
    { month: "May", totalGaji: 910000000, rataRata: 9100000, bonus: 48000000 },
    { month: "Jun", totalGaji: 890000000, rataRata: 8900000, bonus: 52000000 },
  ];

  const stats: ReportStat[] = useMemo(() => {
    switch (activeTab) {
      case "absensi":
        return [
          { title: "Rata-rata Kehadiran", value: "91.3%", change: "+2.1%", icon: TrendingUp, color: "from-green-400 to-green-600", bgColor: "bg-green-50" },
          { title: "Total Izin", value: "35", change: "-5", icon: Calendar, color: "from-blue-400 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Total Sakit", value: "12", change: "+3", icon: Clock, color: "from-orange-400 to-orange-600", bgColor: "bg-orange-50" },
          { title: "Total Alpha", value: "3", change: "-1", icon: Users, color: "from-red-400 to-red-600", bgColor: "bg-red-50" },
        ];
      case "gaji":
        return [
          { title: "Total Pengeluaran Gaji", value: "Rp 5.4M", change: "+8.5%", icon: DollarSign, color: "from-blue-400 to-blue-600", bgColor: "bg-blue-50" },
          { title: "Rata-rata Gaji", value: "Rp 9.0M", change: "+5.2%", icon: TrendingUp, color: "from-green-400 to-green-600", bgColor: "bg-green-50" },
          { title: "Kenaikan YoY", value: "+8.5%", change: "+2.1%", icon: BarChart3, color: "from-purple-400 to-purple-600", bgColor: "bg-purple-50" },
          { title: "Total Bonus", value: "Rp 310M", change: "+12%", icon: DollarSign, color: "from-orange-400 to-orange-600", bgColor: "bg-orange-50" },
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
  };
}
