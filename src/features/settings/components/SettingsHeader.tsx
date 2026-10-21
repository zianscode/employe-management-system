import React from "react";

interface SettingsHeaderProps {
  title?: string;
  description?: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title = "Pengaturan Sistem",
  description = "Kelola konfigurasi dan preferensi aplikasi",
}) => {
  return (
    <div className="bg-gradient-to-r from-accent via-brand to-brand-dark px-8 py-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-white/80 mt-1 text-sm">{description}</p>
    </div>
  );
};

export default SettingsHeader;
