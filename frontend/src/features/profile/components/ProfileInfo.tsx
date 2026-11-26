import React from "react";
import { ProfileData } from "@/shared/types/profile.types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CardHeading } from "@/shared/components/CardHeading";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { Button } from "@/shared/components/ui/button";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { DescriptionList } from "@/shared/components/DescriptionList";

interface ProfileInfoProps {
  data: ProfileData;
  setData: (data: ProfileData) => void;
  onSave: () => void;
  isSaving: boolean;
}

type TextField = { label: string; key: keyof ProfileData; type?: string; wide?: boolean };

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ data, setData, onSave, isSaving }) => {
  const hasEmployee = Boolean(data.idKaryawan && data.idKaryawan !== "-");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setData({ ...data, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const renderFields = (fields: TextField[]) =>
    fields.map((field) => (
      <FormField key={field.key} label={field.label} htmlFor={field.key} className={field.wide ? "sm:col-span-2" : undefined}>
        <Input
          id={field.key}
          type={field.type || "text"}
          value={(data[field.key] as string) ?? ""}
          onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
        />
      </FormField>
    ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <UserAvatar name={data.namaLengkap} src={data.avatar} size="lg" />
            <div>
              <p className="text-base font-semibold text-foreground">{data.namaLengkap}</p>
              <p className="text-sm text-muted-foreground">{data.email}</p>
              <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-primary hover:underline">
                Ganti foto
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div className="border-t border-border pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <DescriptionList
              items={[
                { label: "NIP", value: data.idKaryawan },
                { label: "Divisi", value: hasEmployee ? data.departemen : "-" },
                { label: "Jabatan", value: hasEmployee ? data.jabatan : "-" },
                { label: "Bergabung", value: data.tanggalBergabung },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeading title="Data pribadi" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderFields([
            { label: "Nama lengkap", key: "namaLengkap" },
            { label: "Email", key: "email", type: "email" },
            { label: "Telepon", key: "nomorTelepon" },
          ])}
          <FormField label="Jenis kelamin" htmlFor="jenisKelamin">
            <NativeSelect
              id="jenisKelamin"
              value={data.jenisKelamin ?? ""}
              onChange={(e) => setData({ ...data, jenisKelamin: e.target.value })}
            >
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </NativeSelect>
          </FormField>
          {renderFields([
            { label: "Tempat lahir", key: "tempatLahir" },
            { label: "Tanggal lahir", key: "tanggalLahir", type: "date" },
          ])}
          <FormField label="Alamat" htmlFor="alamat" className="sm:col-span-2">
            <Textarea id="alamat" rows={2} value={data.alamat} onChange={(e) => setData({ ...data, alamat: e.target.value })} />
          </FormField>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeading title="Identitas dan rekening" />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderFields([
              { label: "NIK", key: "nik" },
              { label: "NPWP", key: "npwp" },
              { label: "Bank", key: "bankName" },
              { label: "Nomor rekening", key: "bankAccount" },
              { label: "Atas nama", key: "bankHolderName", wide: true },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeading title="Kontak darurat" />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderFields([
              { label: "Nama", key: "emergencyName" },
              { label: "Hubungan", key: "emergencyRelation" },
              { label: "Telepon", key: "emergencyPhone" },
            ])}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeading title="Pendidikan dan keahlian" />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Pendidikan terakhir" htmlFor="education">
            <Textarea id="education" rows={2} value={data.education ?? ""} onChange={(e) => setData({ ...data, education: e.target.value })} />
          </FormField>
          <FormField label="Keahlian" htmlFor="skills" hint="Pisahkan dengan koma">
            <Textarea id="skills" rows={2} value={data.skills ?? ""} onChange={(e) => setData({ ...data, skills: e.target.value })} />
          </FormField>
          <FormField label="Tentang saya" htmlFor="bio" className="sm:col-span-2">
            <Textarea id="bio" rows={3} value={data.bio ?? ""} onChange={(e) => setData({ ...data, bio: e.target.value })} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          Simpan perubahan
        </Button>
      </div>
    </form>
  );
};
