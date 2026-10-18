import React from "react";
import Image from "next/image";
import { User, MapPin, Phone, Calendar, ArrowRight } from "lucide-react";
import { FormInput } from "@/features/onboarding/components/FormInput";
import { CITIES, COUNTRY_OPTIONS, OnboardingFormData } from "@/features/onboarding/constants";

interface PersonalInfoStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  avatarPreview: string | null;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAvatar: () => void;
}

export const PersonalInfoStep = ({
  formData,
  errors,
  focusedField,
  setFocusedField,
  handleInputChange,
  handlePhoneChange,
  countryCode,
  setCountryCode,
  avatarPreview,
  handleAvatarChange,
  handleRemoveAvatar
}: PersonalInfoStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="relative group">
          <label 
            htmlFor="avatar-input"
            className="relative w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center transition-all cursor-pointer hover:border-[#E02F75]/50 hover:shadow-md active:scale-95"
          >
            {avatarPreview ? (
              <Image 
                src={avatarPreview} 
                alt="Preview" 
                width={96} 
                height={96} 
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <User size={24} className="text-slate-200" />
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Pilih Foto</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <span className="text-white text-[9px] font-black uppercase tracking-wider">Ganti</span>
            </div>
          </label>
          <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-base font-bold text-slate-900">Foto Profil</h4>
          <p className="text-slate-400 text-[10px] font-medium max-w-[180px]">Gunakan foto formal untuk identitas resmi perusahaan.</p>
          <button 
            type="button" 
            onClick={handleRemoveAvatar}
            className="inline-flex items-center gap-2 text-[#E02F75] text-[9px] font-black uppercase tracking-widest mt-2 px-3 py-1.5 bg-pink-50 rounded-lg hover:bg-pink-100 transition-all active:scale-95"
          >
            Hapus Foto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.phone ? "text-[#E02F75]" : focusedField === "phone" ? "text-[#E02F75]" : "text-slate-400"}`}>
            Nomor HP / WhatsApp
          </label>
          <div className="flex gap-2">
            <div className="relative shrink-0 w-28">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={`w-full py-3 pl-4 pr-8 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                  errors.phone ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
                }`}
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.code}
                  </option>
                ))}
              </select>
              <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={12} />
            </div>

            <div className="relative flex-1 group">
              <Phone 
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.phone ? "text-[#E02F75]" : focusedField === "phone" ? "text-[#E02F75]" : "text-slate-300"}`} 
                size={16} 
              />
              <input 
                name="phone" 
                type="text"
                required 
                value={formData.phone} 
                onChange={handlePhoneChange} 
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                placeholder="8123456789" 
                className={`w-full pl-14 pr-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-200 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all ${
                  errors.phone ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
                }`} 
              />
            </div>
          </div>
          {errors.phone && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.phone}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.gender ? "text-[#E02F75]" : "text-slate-400"}`}>
            Jenis Kelamin
          </label>
          <div className="relative">
             <select 
              name="gender" 
              required 
              value={formData.gender} 
              onChange={handleInputChange} 
              className={`w-full px-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.gender ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Gender</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.gender && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.gender}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.placeOfBirth ? "text-[#E02F75]" : focusedField === "placeOfBirth" ? "text-[#E02F75]" : "text-slate-400"}`}>
            Tempat Lahir
          </label>
          <div className="relative">
            <MapPin 
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.placeOfBirth ? "text-[#E02F75]" : focusedField === "placeOfBirth" ? "text-[#E02F75]" : "text-slate-300"}`} 
              size={16} 
            />
            <select 
              name="placeOfBirth" 
              required 
              value={formData.placeOfBirth} 
              onChange={handleInputChange} 
              onFocus={() => setFocusedField("placeOfBirth")}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-14 pr-10 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.placeOfBirth ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Tempat Lahir</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.placeOfBirth && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.placeOfBirth}
            </p>
          )}
        </div>
        <FormInput 
          label="Tanggal Lahir" 
          name="birthDate" 
          type="date"
          icon={Calendar} 
          value={formData.birthDate}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("birthDate")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "birthDate"}
          error={errors.birthDate}
        />
      </div>
      <div className="space-y-2">
        <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.address ? "text-[#E02F75]" : "text-slate-400"}`}>
          Alamat Lengkap
        </label>
        <textarea 
          name="address" 
          required 
          value={formData.address} 
          onChange={handleInputChange} 
          rows={3} 
          placeholder="Jl. Merdeka No. 123, Blok C..." 
          className={`w-full px-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all resize-none ${
            errors.address ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
          }`}
        ></textarea>
        {errors.address && (
          <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
            {errors.address}
          </p>
        )}
      </div>
    </div>
  );
};
