import React from "react";
import { Search, Filter } from "lucide-react";

interface LeaveControlsProps {
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onTypeChange: (val: string) => void;
}

const LeaveControls: React.FC<LeaveControlsProps> = ({
  searchQuery,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusChange,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari permohonan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="MANAGER_APPROVED">Disetujui Atasan</option>
            <option value="HR_APPROVED">Disetujui HR</option>
            <option value="REJECTED">Ditolak</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">Semua Jenis</option>
            <option value="ANNUAL">Cuti Tahunan</option>
            <option value="SICK">Sakit</option>
            <option value="EMERGENCY">Izin Penting</option>
            <option value="UNPAID">Cuti Diluar Tanggungan</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LeaveControls;
