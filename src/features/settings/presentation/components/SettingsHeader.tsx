import React from "react";

interface SettingsHeaderProps {
  title?: string;
  description?: string;
  onSave?: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title = "Pengaturan Sistem",
  description = "Kelola konfigurasi dan preferensi aplikasi",
  onSave = () => console.log("Settings Saved"),
}) => {
  return (
    <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white/80 mt-1 text-sm">{description}</p>
        </div>
        <button
          onClick={onSave}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 w-full md:w-auto"
        >
          Simpan Semua
        </button>
      </div>
    </div>
  );
};

export default SettingsHeader;
