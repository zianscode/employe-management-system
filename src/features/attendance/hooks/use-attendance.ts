import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Attendance } from "@/shared/types/attendance.types";
import { getDailyAttendanceAction } from "@/server/modules/attendance/attendance.actions";

export function useAttendance(initialDate: string) {
  const [data, setData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await getDailyAttendanceAction(selectedDate);
    if (res.success && res.data) setData(res.data);
    else toast.error(res.message);
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchesSearch = item.nama.toLowerCase().includes(q) || item.nip.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
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
    refresh: fetchData,
  };
}
