import React from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/shared/components/ui/Form";

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
        <Input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} className="sm:w-40" />
        <Select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-44">
          <option value="all">Semua status</option>
          <option value="PRESENT">Hadir</option>
          <option value="LATE">Terlambat</option>
          <option value="EARLY_LEAVE">Pulang cepat</option>
          <option value="PERMISSION">Izin / cuti</option>
          <option value="SICK">Sakit</option>
          <option value="ABSENT">Tidak hadir</option>
          <option value="NOT_YET">Belum absen</option>
        </Select>
      </div>
    </div>
  );
};

export default AttendanceControls;
