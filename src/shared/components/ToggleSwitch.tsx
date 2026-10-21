import React from "react";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label?: string;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  label,
  description,
}) => {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div>
          {label && <h4 className="font-medium text-gray-900">{label}</h4>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
          enabled ? "bg-brand-dark" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200 ${
            enabled ? "left-6" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
};
