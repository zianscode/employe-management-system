import React from "react";
import { Search, Filter, Calendar } from "lucide-react";

interface AttendanceControlsProps {
  searchQuery: string;
  selectedDate: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onStatusChange: (val: string) => void;
}

const AttendanceControls: React.FC<AttendanceControlsProps> = ({
  searchQuery,
  selectedDate,
  statusFilter,
  onSearchChange,
  onDateChange,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari karyawan..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E02F75] outline-none shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="terlambat">Terlambat</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="alpha">Alpha</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AttendanceControls;
