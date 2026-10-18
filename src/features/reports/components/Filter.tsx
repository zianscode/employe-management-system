import React from "react";
import { Filter as FilterIcon, Calendar, Download } from "lucide-react";

interface FilterProps {
  selectedMonth: string;
  onMonthChange: (val: string) => void;
}

const Filter: React.FC<FilterProps> = ({ selectedMonth, onMonthChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <select 
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
          >
            <option value="Januari 2024">Januari 2024</option>
            <option value="Februari 2024">Februari 2024</option>
            <option value="Maret 2024">Maret 2024</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
          <FilterIcon size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter Lanjutan</span>
        </button>
      </div>

      <button className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all font-medium">
        <Download size={18} />
        <span>Ekspor Laporan</span>
      </button>
    </div>
  );
};

export default Filter;
