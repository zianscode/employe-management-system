import { useState, useEffect, useMemo } from "react";
import { Attendance } from "../../domain/entities/attendance";
import { AttendanceRepositoryImpl } from "../../data/repositories/attendance-repository-impl";

const repository = new AttendanceRepositoryImpl();

export function useAttendance(initialDate: string) {
  const [data, setData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await repository.getAttendanceByDate(selectedDate);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  return {
    data: filteredData,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
  };
}
