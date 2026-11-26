import React from "react";
import { OnboardingFormData } from "@/features/onboarding/constants";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect } from "@/shared/components/ui/native-select";

interface IdentityStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BTN", "CIMB Niaga", "Permata", "Lainnya"];

export const IdentityStep = ({ formData, errors, handleInputChange }: IdentityStepProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="NIK (KTP)" htmlFor="identityNumber" required error={errors.identityNumber} hint="16 digit">
        <Input
          id="identityNumber"
          name="identityNumber"
          inputMode="numeric"
          required
          value={formData.identityNumber}
          onChange={handleInputChange}
        />
      </FormField>
      <FormField label="NPWP" htmlFor="npwpNumber" error={errors.npwpNumber} hint="Opsional, 15 atau 16 digit">
        <Input id="npwpNumber" name="npwpNumber" inputMode="numeric" value={formData.npwpNumber} onChange={handleInputChange} />
      </FormField>
      <FormField label="Bank" htmlFor="bankName" required error={errors.bankName}>
        <NativeSelect id="bankName" name="bankName" required value={formData.bankName} onChange={handleInputChange}>
          <option value="">Pilih bank</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      <FormField label="Nomor rekening" htmlFor="bankAccount" required error={errors.bankAccount}>
        <Input
          id="bankAccount"
          name="bankAccount"
          inputMode="numeric"
          required
          value={formData.bankAccount}
          onChange={handleInputChange}
        />
      </FormField>
      <FormField
        label="Nama pemilik rekening"
        htmlFor="bankHolderName"
        required
        error={errors.bankHolderName}
        hint="Sesuai buku tabungan"
        className="sm:col-span-2"
      >
        <Input id="bankHolderName" name="bankHolderName" required value={formData.bankHolderName} onChange={handleInputChange} />
      </FormField>
    </div>
  );
};
