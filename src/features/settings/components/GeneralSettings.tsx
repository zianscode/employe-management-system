import React from "react";
import { Settings, Database } from "lucide-react";
import { ToggleSwitch } from "@/shared/components/ToggleSwitch";
import { SystemSettings } from "@/shared/types/settings.types";

interface GeneralSettingsProps {
  settings: SystemSettings;
  onToggle: (setting: keyof SystemSettings) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onToggle }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Pengaturan Aplikasi</h3>
            <p className="text-gray-500">Konfigurasi dasar aplikasi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Aplikasi</label>
            <input
              type="text"
              defaultValue="Employee Management System"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
            <Database className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Pengaturan Data</h3>
            <p className="text-gray-500">Konfigurasi penyimpanan dan backup</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-500">Backup otomatis setiap hari</p>
            </div>
            <ToggleSwitch
              enabled={settings.autoBackup}
              onChange={() => onToggle("autoBackup")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
