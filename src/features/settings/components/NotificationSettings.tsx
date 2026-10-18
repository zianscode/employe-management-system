import React from "react";
import { Mail, Bell } from "lucide-react";
import { ToggleSwitch } from "@/shared/components/ToggleSwitch";
import { SystemSettings } from "@/shared/types/settings.types";

interface NotificationSettingsProps {
  settings: SystemSettings;
  onToggle: (key: keyof SystemSettings) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, onToggle }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-gray-500">Pengaturan notifikasi email</p>
          </div>
        </div>

        <div className="space-y-6">
          {(
            [
              { label: "Karyawan Baru", desc: "Notifikasi saat ada karyawan baru", key: "newEmployee" },
              { label: "Permohonan Cuti", desc: "Notifikasi permohonan cuti", key: "leaveRequest" },
              { label: "Laporan Bulanan", desc: "Kirim laporan setiap bulan", key: "monthlyReport" },
              { label: "Backup Selesai", desc: "Notifikasi backup berhasil", key: "backupComplete" },
            ] as const
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <ToggleSwitch
                enabled={settings[item.key]}
                onChange={() => onToggle(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
            <Bell className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">System Notifications</h3>
            <p className="text-gray-500">Pengaturan notifikasi sistem</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "SMTP Server", val: "smtp.gmail.com" },
            { label: "SMTP Port", val: "587", type: "number" },
            { label: "SMTP Username", val: "noreply@company.com", type: "email" },
            { label: "SMTP Password", val: "••••••••", type: "password" },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <input
                type={field.type || "text"}
                defaultValue={field.val}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E02F75] outline-none"
              />
            </div>
          ))}
          <button className="w-full py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg hover:opacity-90 transition-opacity font-bold">
            Test Email Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
