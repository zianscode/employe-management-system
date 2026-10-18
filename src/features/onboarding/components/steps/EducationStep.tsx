import React from "react";
import { Award, MapPin, ArrowRight } from "lucide-react";
import { FormInput } from "@/features/onboarding/components/FormInput";
import { OnboardingFormData, SUGGESTED_SKILLS } from "@/features/onboarding/constants";

interface EducationStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  years: string[];
}

export const EducationStep = ({
  formData,
  errors,
  focusedField,
  setFocusedField,
  handleInputChange,
  selectedSkills,
  toggleSkill,
  years
}: EducationStepProps) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-pink-50/60 border border-pink-100/50 rounded-2xl text-slate-700 text-[11px] font-medium leading-relaxed md:col-span-2">
          <div className="flex gap-3">
            <Award size={16} className="text-[#E02F75] shrink-0 animate-pulse" />
            <span>
              <strong>Petunjuk Pengisian:</strong> Silakan masukkan data <strong>pendidikan terakhir</strong> yang telah Anda selesaikan, ATAU <strong>pendidikan saat ini yang sedang Anda tempuh</strong> (jika sedang melanjutkan studi / belum lulus).
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.eduLevel ? "text-[#E02F75]" : "text-slate-400"}`}>
            Jenjang Pendidikan (Terakhir / Sedang Ditempuh)
          </label>
          <div className="relative">
            <select 
              name="eduLevel" 
              required 
              value={formData.eduLevel} 
              onChange={handleInputChange} 
              className={`w-full pl-5 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.eduLevel ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Jenjang</option>
              <option value="SMA/SMK">SMA / SMK (Sekolah Menengah)</option>
              <option value="D3">Diploma 3 (D3)</option>
              <option value="S1">Sarjana (S1 / Diploma 4)</option>
              <option value="S2">Magister / Pascasarjana (S2)</option>
              <option value="S3">Doktor (S3)</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.eduLevel && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.eduLevel}
            </p>
          )}
        </div>
        <FormInput 
          label="Jurusan / Bidang Studi"
          name="eduMajor" 
          icon={Award} 
          placeholder="Contoh: Teknik Informatika, IPA, IPS, Perhotelan, dll."
          value={formData.eduMajor}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("eduMajor")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "eduMajor"}
          error={errors.eduMajor}
        />
        <div className="md:col-span-2">
          <FormInput 
            label="Nama Sekolah / Universitas / Lembaga Pendidikan"
            name="eduUniv" 
            icon={MapPin} 
            placeholder="Contoh: Universitas Indonesia, SMK Negeri 1 Jakarta, dll."
            value={formData.eduUniv}
            onChange={handleInputChange}
            onFocus={() => setFocusedField("eduUniv")}
            onBlur={() => setFocusedField(null)}
            isFocused={focusedField === "eduUniv"}
            error={errors.eduUniv}
          />
        </div>
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.eduStartYear ? "text-[#E02F75]" : "text-slate-400"}`}>
            Tahun Masuk Pendidikan
          </label>
          <div className="relative">
            <select 
              name="eduStartYear" 
              required 
              value={formData.eduStartYear} 
              onChange={handleInputChange} 
              className={`w-full pl-5 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.eduStartYear ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Tahun Masuk</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.eduStartYear && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.eduStartYear}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.eduEndYear ? "text-[#E02F75]" : "text-slate-400"}`}>
            Tahun Lulus / Estimasi Lulus (Pilih estimasi jika sedang ditempuh)
          </label>
          <div className="relative">
            <select 
              name="eduEndYear" 
              required 
              value={formData.eduEndYear} 
              onChange={handleInputChange} 
              className={`w-full pl-5 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.eduEndYear ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Tahun Lulus / Estimasi</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.eduEndYear && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.eduEndYear}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Professional Skills</label>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                selectedSkills.includes(skill)
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Biodata Singkat</label>
        <textarea 
          name="bio" 
          value={formData.bio} 
          onChange={handleInputChange} 
          rows={4} 
          placeholder="Tuliskan pengalaman atau motivasi singkat Anda..." 
          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all resize-none"
        ></textarea>
      </div>
    </div>
  );
};
