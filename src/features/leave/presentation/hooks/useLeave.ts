import { useState, useMemo } from "react";
import { LeaveRequest } from "../../domain/entities/leave";

export function useLeave() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const leaveData: LeaveRequest[] = [
    {
      nip: "EMP001",
      nama: "John Doe",
      tipeCuti: "Cuti Tahunan",
      tanggalMulai: "15/2/2024",
      tanggalSelesai: "17/2/2024",
      durasi: "3 hari",
      status: "Pending",
    },
    {
      nip: "EMP002",
      nama: "Jane Smith",
      tipeCuti: "Cuti Sakit",
      tanggalMulai: "10/2/2024",
      tanggalSelesai: "12/2/2024",
      durasi: "3 hari",
      status: "Disetujui",
    },
    {
      nip: "EMP003",
      nama: "Mike Johnson",
      tipeCuti: "Cuti Tahunan",
      tanggalMulai: "20/2/2024",
      tanggalSelesai: "25/2/2024",
      durasi: "6 hari",
      status: "Ditolak",
    },
    {
      nip: "EMP004",
      nama: "Sarah Wilson",
      tipeCuti: "Cuti Melahirkan",
      tanggalMulai: "1/3/2024",
      tanggalSelesai: "30/5/2024",
      durasi: "90 hari",
      status: "Disetujui",
    },
    {
      nip: "EMP005",
      nama: "David Brown",
      tipeCuti: "Cuti Tahunan",
      tanggalMulai: "28/2/2024",
      tanggalSelesai: "1/3/2024",
      durasi: "2 hari",
      status: "Pending",
    },
  ];

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
  }, [searchQuery, statusFilter, typeFilter]);

  return {
    data: filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  };
}
