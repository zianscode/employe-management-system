import React from "react";
import { OnboardingFormData } from "@/features/onboarding/constants";
import { Field, Input, Select } from "@/shared/components/ui/Form";

interface EmergencyStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const RELATIONS = [
  { value: "Orang Tua", label: "Orang tua" },
  { value: "Pasangan", label: "Pasangan (suami/istri)" },
  { value: "Saudara Kandung", label: "Saudara kandung" },
  { value: "Anak", label: "Anak" },
  { value: "Keluarga Besar", label: "Keluarga besar" },
  { value: "Teman / Kerabat", label: "Teman / kerabat" },
];

export const EmergencyStep = ({ formData, errors, handleInputChange }: EmergencyStepProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Isi dengan keluarga terdekat yang bisa dihubungi saat keadaan darurat.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama" htmlFor="emergencyName" required error={errors.emergencyName}>
          <Input id="emergencyName" name="emergencyName" required value={formData.emergencyName} onChange={handleInputChange} />
        </Field>
        <Field label="Hubungan" htmlFor="emergencyRelation" required error={errors.emergencyRelation}>
          <Select id="emergencyRelation" name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleInputChange}>
            <option value="">Pilih</option>
            {RELATIONS.map((relation) => (
              <option key={relation.value} value={relation.value}>
                {relation.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nomor telepon" htmlFor="emergencyPhone" required error={errors.emergencyPhone}>
          <Input
            id="emergencyPhone"
            name="emergencyPhone"
            inputMode="numeric"
            required
            value={formData.emergencyPhone}
            onChange={handleInputChange}
            placeholder="08..."
          />
        </Field>
      </div>
    </div>
  );
};
