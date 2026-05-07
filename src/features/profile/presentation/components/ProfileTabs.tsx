import React from "react";
import { User, Shield, Bell, Activity } from "lucide-react";
import { ProfileTabId } from "../../domain/entities/profile";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onTabChange: (id: ProfileTabId) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "profil", label: "Profil Saya", icon: User },
    { id: "keamanan", label: "Keamanan Akun", icon: Shield },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "aktivitas", label: "Aktivitas Login", icon: Activity },
  ];

  return (
    <div className="flex overflow-x-auto gap-4 mb-8 pb-1 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as ProfileTabId)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
              isActive
                ? "bg-white text-[#E02F75] shadow-md border border-gray-100 translate-y-[-2px]"
                : "text-gray-500 hover:bg-white hover:text-gray-700"
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
