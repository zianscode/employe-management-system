import React from "react";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColorClass,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconColorClass} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
