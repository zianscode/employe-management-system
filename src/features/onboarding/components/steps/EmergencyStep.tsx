import React from "react";
import { ShieldAlert, User, Phone, ArrowRight } from "lucide-react";
import { FormInput } from "@/features/onboarding/components/FormInput";
import { OnboardingFormData } from "@/features/onboarding/constants";

interface EmergencyStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const EmergencyStep = ({
  formData,
  errors,
  focusedField,
  setFocusedField,
  handleInputChange
}: EmergencyStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-[11px] font-medium leading-relaxed">
        <div className="flex gap-3">
          <ShieldAlert size={16} className="text-amber-500 shrink-0" />
          Penting: Mohon isi kontak keluarga terdekat yang dapat dihubungi sewaktu-waktu dalam keadaan darurat.
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput 
          label="Nama Kontak Darurat" 
          name="emergencyName" 
          icon={User} 
          placeholder="Nama Lengkap Keluarga" 
          value={formData.emergencyName}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("emergencyName")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "emergencyName"}
          error={errors.emergencyName}
        />
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.emergencyRelation ? "text-[#E02F75]" : "text-slate-400"}`}>
            Hubungan
          </label>
          <div className="relative">
            <select 
              name="emergencyRelation" 
              required 
              value={formData.emergencyRelation} 
              onChange={handleInputChange} 
              className={`w-full px-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.emergencyRelation ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Relasi</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Pasangan">Pasangan (Suami/Istri)</option>
              <option value="Saudara Kandung">Saudara Kandung</option>
              <option value="Anak">Anak</option>
              <option value="Keluarga Besar">Keluarga Besar</option>
              <option value="Teman / Kerabat">Teman / Kerabat</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.emergencyRelation && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.emergencyRelation}
            </p>
          )}
        </div>
      </div>
      <FormInput 
        label="Nomor Telepon Darurat" 
        name="emergencyPhone" 
        icon={Phone} 
        placeholder="08..." 
        value={formData.emergencyPhone}
        onChange={handleInputChange}
        onFocus={() => setFocusedField("emergencyPhone")}
        onBlur={() => setFocusedField(null)}
        isFocused={focusedField === "emergencyPhone"}
        error={errors.emergencyPhone}
      />
    </div>
  );
};
