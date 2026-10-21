import React from "react";
import { Shield, Key } from "lucide-react";
import { ToggleSwitch } from "@/shared/components/ToggleSwitch";
import { SystemSettings } from "@/shared/types/settings.types";

interface SystemSecurityProps {
  settings: SystemSettings;
  onToggle: (key: keyof SystemSettings) => void;
}

export const SystemSecurity: React.FC<SystemSecurityProps> = ({ settings, onToggle }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-brand rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Keamanan Login</h3>
            <p className="text-gray-500">Pengaturan keamanan akses sistem</p>
          </div>
        </div>

        <div className="space-y-6">
          {(
            [
              { label: "Two-Factor Authentication", desc: "Aktifkan 2FA untuk keamanan ekstra", key: "twoFactor" },
              { label: "Force Password Change", desc: "Wajib ganti password setiap 90 hari", key: "forcePasswordChange" },
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (menit)</label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maksimal Percobaan Login</label>
            <input
              type="number"
              defaultValue="5"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center">
            <Key className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">API & Integrasi</h3>
            <p className="text-gray-500">Pengaturan API dan integrasi eksternal</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex space-x-2">
              <input
                type="password"
                defaultValue="••••••••••••••••"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                readOnly
              />
              <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                👁️
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">API Rate Limiting</h4>
              <p className="text-sm text-gray-500">Batasi request per menit</p>
            </div>
            <ToggleSwitch
              enabled={settings.apiRateLimit}
              onChange={() => onToggle("apiRateLimit")}
            />
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-accent to-brand text-white rounded-lg hover:opacity-90 transition-opacity font-bold">
            Generate New API Key
          </button>
        </div>
      </div>
    </div>
  );
};
