import React from "react";
import { Download } from "lucide-react";

interface AttendanceHeaderProps {
  onDownload: () => void;
}

const AttendanceHeader = ({ onDownload }: AttendanceHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-accent via-brand to-brand-dark px-8 py-6 rounded-2xl shadow-lg border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Presensi Karyawan</h1>
          <p className="text-white/80 mt-1 text-sm font-medium">Monitoring kehadiran dan kedisiplinan tim secara real-time</p>
        </div>
        <button onClick={onDownload} className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand rounded-xl hover:bg-gray-100 transition-all shadow-lg font-bold text-sm">
          <Download size={16} />
          <span>Unduh Laporan</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceHeader;
