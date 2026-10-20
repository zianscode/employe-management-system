import React from "react";
import { Download } from "lucide-react";

interface ReportSectionProps {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  children: React.ReactNode;
}

export function ReportSection({ title, subtitle, onExport, children }: ReportSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all"
          >
            <Download size={16} />
            Ekspor CSV
          </button>
        )}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}
