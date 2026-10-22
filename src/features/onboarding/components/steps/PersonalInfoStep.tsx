import React from "react";
import { CITIES, COUNTRY_OPTIONS, OnboardingFormData } from "@/features/onboarding/constants";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Form";
import { Avatar } from "@/shared/components/ui/Avatar";

interface PersonalInfoStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
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
  handleInputChange,
  handlePhoneChange,
  countryCode,
  setCountryCode,
  avatarPreview,
  handleAvatarChange,
  handleRemoveAvatar,
}: PersonalInfoStepProps) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={avatarPreview} size="lg" className="bg-gray-100 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">Foto profil</p>
          <p className="text-sm text-gray-500">Opsional. Gunakan foto formal.</p>
          <div className="mt-1 flex gap-3 text-sm">
            <label htmlFor="avatar-input" className="cursor-pointer font-medium text-brand hover:underline">
              {avatarPreview ? "Ganti foto" : "Pilih foto"}
            </label>
            {avatarPreview && (
              <button type="button" onClick={handleRemoveAvatar} className="text-gray-500 hover:text-gray-900">
                Hapus
              </button>
            )}
          </div>
          <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nomor HP / WhatsApp" htmlFor="phone" required error={errors.phone}>
          <div className="flex gap-2">
            <Select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-24 shrink-0" aria-label="Kode negara">
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.code}
                </option>
              ))}
            </Select>
            <Input
              id="phone"
              name="phone"
              inputMode="numeric"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="8123456789"
            />
          </div>
        </Field>
        <Field label="Jenis kelamin" htmlFor="gender" required error={errors.gender}>
          <Select id="gender" name="gender" required value={formData.gender} onChange={handleInputChange}>
            <option value="">Pilih</option>
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </Select>
        </Field>
        <Field label="Tempat lahir" htmlFor="placeOfBirth" required error={errors.placeOfBirth}>
          <Select id="placeOfBirth" name="placeOfBirth" required value={formData.placeOfBirth} onChange={handleInputChange}>
            <option value="">Pilih kota</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="Lainnya">Lainnya</option>
          </Select>
        </Field>
        <Field label="Tanggal lahir" htmlFor="birthDate" required error={errors.birthDate}>
          <Input id="birthDate" name="birthDate" type="date" required value={formData.birthDate} onChange={handleInputChange} />
        </Field>
      </div>

      <Field label="Alamat lengkap" htmlFor="address" required error={errors.address}>
        <Textarea
          id="address"
          name="address"
          required
          rows={3}
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kota"
        />
      </Field>
    </div>
  );
};
