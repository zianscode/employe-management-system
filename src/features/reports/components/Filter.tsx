import React from "react";
import { Calendar } from "lucide-react";

interface FilterProps {
  selectedMonth: string;
  onMonthChange: (val: string) => void;
}

const Filter: React.FC<FilterProps> = ({ selectedMonth, onMonthChange }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm w-fit">
      <Calendar size={18} className="text-gray-400" />
      <span className="text-sm text-gray-500">Periode</span>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => e.target.value && onMonthChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
      />
    </div>
  );
};

export default Filter;
