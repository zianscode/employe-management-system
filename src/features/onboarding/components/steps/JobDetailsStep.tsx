import React from "react";
import { Briefcase, User, ArrowRight } from "lucide-react";
import { FormInput } from "@/features/onboarding/components/FormInput";
import { OnboardingFormData } from "@/features/onboarding/constants";
import { POSITION_DEPARTMENT_MAPPING } from "@/shared/utils/position-department";

const STANDARD_POSITIONS = Object.keys(POSITION_DEPARTMENT_MAPPING);

interface JobDetailsStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const JobDetailsStep = ({
  formData,
  errors,
  focusedField,
  setFocusedField,
  handleInputChange
}: JobDetailsStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className={`space-y-2 ${formData.positionName === "other" ? "md:col-span-1" : "md:col-span-2"}`}>
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.positionName ? "text-[#E02F75]" : "text-slate-400"}`}>
            Posisi / Jabatan yang Dilamar
          </label>
          <div className="relative">
            <Briefcase 
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.positionName ? "text-[#E02F75]" : focusedField === "positionName" ? "text-[#E02F75]" : "text-slate-300"}`} 
              size={16} 
            />
            <select 
              name="positionName" 
              required 
              value={formData.positionName} 
              onChange={handleInputChange} 
              onFocus={() => setFocusedField("positionName")}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-14 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.positionName ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Posisi / Jabatan</option>
              {STANDARD_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
              <option value="other">Lainnya (Tulis Sendiri)</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.positionName && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.positionName}
            </p>
          )}
        </div>

        {formData.positionName === "other" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <FormInput 
              label="Nama Posisi / Jabatan Kustom" 
              name="customPosition" 
              icon={Briefcase} 
              placeholder="Contoh: Graphic Designer, UI Developer, dsb." 
              value={formData.customPosition}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("customPosition")}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === "customPosition"}
              error={errors.customPosition}
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.employmentType ? "text-[#E02F75]" : "text-slate-400"}`}>
            Tipe Pekerjaan / Kontrak
          </label>
          <div className="relative">
            <User 
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.employmentType ? "text-[#E02F75]" : "text-slate-300"}`} 
              size={16} 
            />
            <select 
              name="employmentType" 
              required 
              value={formData.employmentType} 
              onChange={handleInputChange} 
              className={`w-full pl-14 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.employmentType ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="FULL_TIME">Full-Time (Penuh Waktu)</option>
              <option value="PART_TIME">Part-Time (Paruh Waktu)</option>
              <option value="CONTRACT">Kontrak (Contract)</option>
              <option value="INTERNSHIP">Magang (Internship)</option>
              <option value="REMOTE">Bekerja Remote</option>
              <option value="FREELANCE">Pekerja Lepas (Freelance)</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.employmentType && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.employmentType}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
