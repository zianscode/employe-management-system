import React from "react";
import { CreditCard, ShieldAlert, User, ArrowRight } from "lucide-react";
import { FormInput } from "@/features/onboarding/components/FormInput";
import { OnboardingFormData } from "@/features/onboarding/constants";

interface IdentityStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const IdentityStep = ({
  formData,
  errors,
  focusedField,
  setFocusedField,
  handleInputChange
}: IdentityStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput 
          label="Nomor KTP (NIK)" 
          name="identityNumber" 
          icon={CreditCard} 
          placeholder="16 Digit Nomor KTP" 
          value={formData.identityNumber}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("identityNumber")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "identityNumber"}
          error={errors.identityNumber}
        />
        <FormInput 
          label="Nomor NPWP" 
          name="npwpNumber" 
          icon={ShieldAlert} 
          placeholder="Opsional" 
          value={formData.npwpNumber}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("npwpNumber")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "npwpNumber"}
          error={errors.npwpNumber}
        />
        <div className="space-y-2">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 transition-colors duration-300 ${errors.bankName ? "text-[#E02F75]" : "text-slate-400"}`}>
            Nama Bank
          </label>
          <div className="relative">
            <select 
              name="bankName" 
              required 
              value={formData.bankName} 
              onChange={handleInputChange} 
              className={`w-full px-5 py-3 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all appearance-none cursor-pointer ${
                errors.bankName ? "border-[#E02F75] focus:border-[#E02F75]" : "border-slate-200 focus:border-[#E02F75]/50"
              }`}
            >
              <option value="">Pilih Bank Utama</option>
              <option value="BCA">BCA</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="BTN">BTN</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
              <option value="Permata">Permata</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={14} />
          </div>
          {errors.bankName && (
            <p className="text-[#E02F75] text-[10px] font-bold mt-1 ml-2">
              {errors.bankName}
            </p>
          )}
        </div>
        <FormInput 
          label="Nomor Rekening" 
          name="bankAccount" 
          icon={CreditCard} 
          placeholder="000-000-000" 
          value={formData.bankAccount}
          onChange={handleInputChange}
          onFocus={() => setFocusedField("bankAccount")}
          onBlur={() => setFocusedField(null)}
          isFocused={focusedField === "bankAccount"}
          error={errors.bankAccount}
        />
      </div>
      <FormInput 
        label="Nama Lengkap Pemilik Rekening" 
        name="bankHolderName" 
        icon={User} 
        placeholder="Sesuai dengan yang tertera di Buku Tabungan" 
        value={formData.bankHolderName}
        onChange={handleInputChange}
        onFocus={() => setFocusedField("bankHolderName")}
        onBlur={() => setFocusedField(null)}
        isFocused={focusedField === "bankHolderName"}
        error={errors.bankHolderName}
      />
    </div>
  );
};
