import React from "react";
import { CITIES, COUNTRY_OPTIONS, OnboardingFormData } from "@/features/onboarding/constants";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { Button } from "@/shared/components/ui/button";

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
        <UserAvatar src={avatarPreview} size="lg" className="bg-muted text-muted-foreground/70" />
        <div>
          <p className="text-sm font-medium text-foreground">Foto profil</p>
          <p className="text-sm text-muted-foreground">Opsional. Gunakan foto formal.</p>
          <div className="mt-1 flex gap-3 text-sm">
            <label htmlFor="avatar-input" className="cursor-pointer font-medium text-primary hover:underline">
              {avatarPreview ? "Ganti foto" : "Pilih foto"}
            </label>
            {avatarPreview && (
              <Button variant="link" size="sm" onClick={handleRemoveAvatar} className="h-auto p-0 text-muted-foreground">
                Hapus foto
              </Button>
            )}
          </div>
          <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nomor HP / WhatsApp" htmlFor="phone" required error={errors.phone}>
          <div className="flex gap-2">
            <NativeSelect value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-24 shrink-0" aria-label="Kode negara">
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.code}
                </option>
              ))}
            </NativeSelect>
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
        </FormField>
        <FormField label="Jenis kelamin" htmlFor="gender" required error={errors.gender}>
          <NativeSelect id="gender" name="gender" required value={formData.gender} onChange={handleInputChange}>
            <option value="">Pilih</option>
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </NativeSelect>
        </FormField>
        <FormField label="Tempat lahir" htmlFor="placeOfBirth" required error={errors.placeOfBirth}>
          <NativeSelect id="placeOfBirth" name="placeOfBirth" required value={formData.placeOfBirth} onChange={handleInputChange}>
            <option value="">Pilih kota</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="Lainnya">Lainnya</option>
          </NativeSelect>
        </FormField>
        <FormField label="Tanggal lahir" htmlFor="birthDate" required error={errors.birthDate}>
          <Input id="birthDate" name="birthDate" type="date" required value={formData.birthDate} onChange={handleInputChange} />
        </FormField>
      </div>

      <FormField label="Alamat lengkap" htmlFor="address" required error={errors.address}>
        <Textarea
          id="address"
          name="address"
          required
          rows={3}
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kota"
        />
      </FormField>
    </div>
  );
};
