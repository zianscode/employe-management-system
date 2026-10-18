import { useState, useMemo, useEffect } from "react";
import { LeaveRequest } from "@/shared/types/leave.types";
import { getLeaveRequests } from "@/server/modules/leave/leave.actions";

export function useLeave() {
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getLeaveRequests();
      setLeaveData(data as LeaveRequest[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return leaveData.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType =
        typeFilter === "all" || item.tipeCuti.toLowerCase().includes(typeFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveData, searchQuery, statusFilter, typeFilter]);

  return {
    data: filteredData,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh: async () => {
      const data = await getLeaveRequests();
      setLeaveData(data as LeaveRequest[]);
    }
  };
}
