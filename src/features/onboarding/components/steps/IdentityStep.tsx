import React from "react";
import { OnboardingFormData } from "@/features/onboarding/constants";
import { Field, Input, Select } from "@/shared/components/ui/Form";

interface IdentityStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BTN", "CIMB Niaga", "Permata", "Lainnya"];

export const IdentityStep = ({ formData, errors, handleInputChange }: IdentityStepProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="NIK (KTP)" htmlFor="identityNumber" required error={errors.identityNumber} hint="16 digit">
        <Input
          id="identityNumber"
          name="identityNumber"
          inputMode="numeric"
          required
          value={formData.identityNumber}
          onChange={handleInputChange}
        />
      </Field>
      <Field label="NPWP" htmlFor="npwpNumber" error={errors.npwpNumber} hint="Opsional, 15 atau 16 digit">
        <Input id="npwpNumber" name="npwpNumber" inputMode="numeric" value={formData.npwpNumber} onChange={handleInputChange} />
      </Field>
      <Field label="Bank" htmlFor="bankName" required error={errors.bankName}>
        <Select id="bankName" name="bankName" required value={formData.bankName} onChange={handleInputChange}>
          <option value="">Pilih bank</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Nomor rekening" htmlFor="bankAccount" required error={errors.bankAccount}>
        <Input
          id="bankAccount"
          name="bankAccount"
          inputMode="numeric"
          required
          value={formData.bankAccount}
          onChange={handleInputChange}
        />
      </Field>
      <Field
        label="Nama pemilik rekening"
        htmlFor="bankHolderName"
        required
        error={errors.bankHolderName}
        hint="Sesuai buku tabungan"
        className="sm:col-span-2"
      >
        <Input id="bankHolderName" name="bankHolderName" required value={formData.bankHolderName} onChange={handleInputChange} />
      </Field>
    </div>
  );
};
