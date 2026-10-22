import React from "react";
import { Input } from "@/shared/components/ui/Form";

interface FilterProps {
  selectedMonth: string;
  onMonthChange: (val: string) => void;
}

const Filter: React.FC<FilterProps> = ({ selectedMonth, onMonthChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="report-period" className="text-sm text-gray-500">
        Periode
      </label>
      <Input
        id="report-period"
        type="month"
        value={selectedMonth}
        onChange={(e) => e.target.value && onMonthChange(e.target.value)}
        className="w-44"
      />
    </div>
  );
};

export default Filter;
