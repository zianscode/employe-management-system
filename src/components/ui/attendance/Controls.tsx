"use client";

import React from "react";
import { Search, Calendar } from "lucide-react";

interface ControlsProps {
  onSearchChange: (query: string) => void;
  onDateChange: (date: string) => void;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  selectedDate: string;
  statusFilter: string;
}
export default function Controls({
  onSearchChange,
  onDateChange,
  onStatusChange,
  searchQuery,
  selectedDate,
  statusFilter,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
          >
            <option>Semua Status</option>
            <option>Hadir</option>
            <option>Terlambat</option>
            <option>Izin</option>
            <option>Sakit</option>
            <option>Alpha</option>
          </select>
        </div>
      </div>
    </div>
  );
}