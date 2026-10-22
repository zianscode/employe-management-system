import React from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/shared/components/ui/Form";

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
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau NIP"
          className="pl-9 sm:max-w-xs"
        />
      </div>
      <div className="flex gap-3">
        <Select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-44">
          <option value="all">Semua status</option>
          <option value="PENDING">Menunggu</option>
          <option value="MANAGER_APPROVED">Disetujui atasan</option>
          <option value="HR_APPROVED">Disetujui HR</option>
          <option value="REJECTED">Ditolak</option>
          <option value="CANCELLED">Dibatalkan</option>
        </Select>
        <Select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} className="sm:w-48">
          <option value="all">Semua jenis</option>
          <option value="ANNUAL">Cuti tahunan</option>
          <option value="SICK">Sakit</option>
          <option value="EMERGENCY">Izin penting</option>
          <option value="UNPAID">Di luar tanggungan</option>
        </Select>
      </div>
    </div>
  );
};

export default LeaveControls;
