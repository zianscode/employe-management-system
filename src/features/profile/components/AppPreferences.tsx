import React from "react";
import { Settings, Globe, Clock, Calendar, Save } from "lucide-react";
import { UserPreferences } from "@/shared/types/profile.types";

interface AppPreferencesProps {
  data: UserPreferences;
  setData: (data: UserPreferences) => void;
  onSave: () => void;
}

export const AppPreferences: React.FC<AppPreferencesProps> = ({ data, setData, onSave }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings className="text-[#E02F75]" size={24} />
        Preferensi Aplikasi
      </h3>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe size={18} /> Bahasa
          </label>
          <select
            value={data.bahasa}
            onChange={(e) => setData({ ...data, bahasa: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all bg-white"
          >
            <option>Bahasa Indonesia</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock size={18} /> Zona Waktu
          </label>
          <select
            value={data.zonaWaktu}
            onChange={(e) => setData({ ...data, zonaWaktu: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all bg-white"
          >
            <option>Asia/Jakarta (WIB)</option>
            <option>Asia/Makassar (WITA)</option>
            <option>Asia/Jayapura (WIT)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={18} /> Format Tanggal
          </label>
          <select
            value={data.formatTanggal}
            onChange={(e) => setData({ ...data, formatTanggal: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all bg-white"
          >
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2">Item per Halaman</label>
          <select
            value={data.itemPerHalaman}
            onChange={(e) => setData({ ...data, itemPerHalaman: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all bg-white"
          >
            <option>5</option>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Simpan Preferensi
          </button>
        </div>
      </div>
    </div>
  );
};
