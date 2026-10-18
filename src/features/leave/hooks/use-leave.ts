import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { LeaveRequest } from "@/shared/types/leave.types";
import { getLeaveRequestsAction } from "@/server/modules/leave/leave.actions";

export function useLeave() {
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const refresh = useCallback(async () => {
    const res = await getLeaveRequestsAction();
    if (res.success && res.data) setLeaveData(res.data);
    else toast.error(res.message);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return leaveData.filter((item) => {
      const matchesSearch = item.nama.toLowerCase().includes(q) || item.nip.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.tipeCuti === typeFilter;
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
    refresh,
  };
}
