import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  icon: React.ElementType;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  error?: string;
}

export const FormInput = ({ 
  label, 
  name, 
  icon: Icon, 
  placeholder, 
  type = "text", 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  isFocused,
  error
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${error ? "text-[#E02F75]" : isFocused ? "text-[#E02F75]" : "text-slate-400"}`}>
        {label}
      </label>
      <div className="relative group">
        <Icon 
          className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? "text-[#E02F75]" : isFocused ? "text-[#E02F75]" : "text-slate-300"}`} 
          size={16} 
        />
        <input 
          name={name} 
          type={type}
          required={name !== "npwpNumber"} 
          value={value} 
          onChange={onChange} 
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder} 
          className={`w-full pl-14 pr-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-200 outline-none transition-all ${
            error 
              ? "border-[#E02F75] focus:border-[#E02F75] focus:ring-4 focus:ring-[#E02F75]/5" 
              : "border-slate-200 focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5"
          }`} 
        />
      </div>
      {error && (
        <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
          {error}
        </p>
      )}
    </div>
  );
};
