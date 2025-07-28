"use client";

import { useState } from "react";
import Header from "@/components/ui/leave/Header";
import StatsCards from "@/components/ui/leave/StatsCard";
import Controls from "@/components/ui/leave/Controls";
import DataTable from "@/components/ui/leave/DataTable";
import QuickAction from "@/components/ui/leave/QuickActions";

export default function LeavePage() {
  const leaveData = [
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [typeFilter, setTypeFilter] = useState("Semua Tipe");

  const filteredData = leaveData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua Status" || item.status === statusFilter;
    const matchesType =
      typeFilter === "Semua Tipe" || item.tipeCuti === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsCards />

        {/* Controls */}
        <Controls
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
        />

        {/* Data Table */}
        <DataTable data={filteredData} />

        {/* Quick Actions */}
        <QuickAction />
      </div>
    </div>
  );
}
