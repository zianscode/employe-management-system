import React from "react";
import { Activity, Monitor } from "lucide-react";
import { ActivityLogEntry } from "../../domain/entities/profile";

interface ActivityLogProps {
  logs: ActivityLogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Activity className="text-[#E02F75]" size={24} />
        Log Aktivitas
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aktivitas</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Waktu</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Device</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{log.aktivitas}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.waktu}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                  <Monitor size={16} /> {log.device}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
