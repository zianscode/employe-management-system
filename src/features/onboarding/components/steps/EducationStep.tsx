import React from "react";
import { OnboardingFormData, SUGGESTED_SKILLS } from "@/features/onboarding/constants";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Form";
import { cn } from "@/shared/utils/cn";

interface EducationStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  years: string[];
}

const EDUCATION_LEVELS = [
  { value: "SMA/SMK", label: "SMA / SMK" },
  { value: "D3", label: "Diploma 3 (D3)" },
  { value: "S1", label: "Sarjana (S1 / D4)" },
  { value: "S2", label: "Magister (S2)" },
  { value: "S3", label: "Doktor (S3)" },
];

export const EducationStep = ({
  formData,
  errors,
  handleInputChange,
  selectedSkills,
  toggleSkill,
  years,
}: EducationStepProps) => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Isi pendidikan terakhir yang sudah selesai, atau yang sedang ditempuh.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Jenjang" htmlFor="eduLevel" required error={errors.eduLevel}>
          <Select id="eduLevel" name="eduLevel" required value={formData.eduLevel} onChange={handleInputChange}>
            <option value="">Pilih jenjang</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Jurusan" htmlFor="eduMajor" required error={errors.eduMajor}>
          <Input
            id="eduMajor"
            name="eduMajor"
            required
            value={formData.eduMajor}
            onChange={handleInputChange}
            placeholder="Misal: Teknik Informatika"
          />
        </Field>
        <Field label="Sekolah / universitas" htmlFor="eduUniv" required error={errors.eduUniv} className="sm:col-span-2">
          <Input id="eduUniv" name="eduUniv" required value={formData.eduUniv} onChange={handleInputChange} />
        </Field>
        <Field label="Tahun masuk" htmlFor="eduStartYear" required error={errors.eduStartYear}>
          <Select id="eduStartYear" name="eduStartYear" required value={formData.eduStartYear} onChange={handleInputChange}>
            <option value="">Pilih tahun</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tahun lulus" htmlFor="eduEndYear" required error={errors.eduEndYear} hint="Isi perkiraan jika belum lulus">
          <Select id="eduEndYear" name="eduEndYear" required value={formData.eduEndYear} onChange={handleInputChange}>
            <option value="">Pilih tahun</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Keahlian</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.map((skill) => {
            const selected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                aria-pressed={selected}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-sm transition-colors",
                  selected ? "border-brand bg-brand-50 text-brand" : "border-gray-300 text-gray-600 hover:bg-gray-50",
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Tentang saya" htmlFor="bio" hint="Opsional">
        <Textarea id="bio" name="bio" rows={3} value={formData.bio} onChange={handleInputChange} />
      </Field>
    </div>
  );
};
