import React from "react";
import { ProfileData } from "@/shared/types/profile.types";
import { Card, CardBody, CardHeader } from "@/shared/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/shared/components/ui/Form";
import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { DescriptionList } from "@/shared/components/ui/DescriptionList";

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
      <Field key={field.key} label={field.label} htmlFor={field.key} className={field.wide ? "sm:col-span-2" : undefined}>
        <Input
          id={field.key}
          type={field.type || "text"}
          value={(data[field.key] as string) ?? ""}
          onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
        />
      </Field>
    ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar name={data.namaLengkap} src={data.avatar} size="lg" />
            <div>
              <p className="text-base font-semibold text-gray-900">{data.namaLengkap}</p>
              <p className="text-sm text-gray-500">{data.email}</p>
              <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-brand hover:underline">
                Ganti foto
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <DescriptionList
              items={[
                { label: "NIP", value: data.idKaryawan },
                { label: "Divisi", value: hasEmployee ? data.departemen : "-" },
                { label: "Jabatan", value: hasEmployee ? data.jabatan : "-" },
                { label: "Bergabung", value: data.tanggalBergabung },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Data pribadi" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderFields([
            { label: "Nama lengkap", key: "namaLengkap" },
            { label: "Email", key: "email", type: "email" },
            { label: "Telepon", key: "nomorTelepon" },
          ])}
          <Field label="Jenis kelamin" htmlFor="jenisKelamin">
            <Select
              id="jenisKelamin"
              value={data.jenisKelamin ?? ""}
              onChange={(e) => setData({ ...data, jenisKelamin: e.target.value })}
            >
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </Select>
          </Field>
          {renderFields([
            { label: "Tempat lahir", key: "tempatLahir" },
            { label: "Tanggal lahir", key: "tanggalLahir", type: "date" },
          ])}
          <Field label="Alamat" htmlFor="alamat" className="sm:col-span-2">
            <Textarea id="alamat" rows={2} value={data.alamat} onChange={(e) => setData({ ...data, alamat: e.target.value })} />
          </Field>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Identitas dan rekening" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderFields([
              { label: "NIK", key: "nik" },
              { label: "NPWP", key: "npwp" },
              { label: "Bank", key: "bankName" },
              { label: "Nomor rekening", key: "bankAccount" },
              { label: "Atas nama", key: "bankHolderName", wide: true },
            ])}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Kontak darurat" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderFields([
              { label: "Nama", key: "emergencyName" },
              { label: "Hubungan", key: "emergencyRelation" },
              { label: "Telepon", key: "emergencyPhone" },
            ])}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Pendidikan dan keahlian" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pendidikan terakhir" htmlFor="education">
            <Textarea id="education" rows={2} value={data.education ?? ""} onChange={(e) => setData({ ...data, education: e.target.value })} />
          </Field>
          <Field label="Keahlian" htmlFor="skills" hint="Pisahkan dengan koma">
            <Textarea id="skills" rows={2} value={data.skills ?? ""} onChange={(e) => setData({ ...data, skills: e.target.value })} />
          </Field>
          <Field label="Tentang saya" htmlFor="bio" className="sm:col-span-2">
            <Textarea id="bio" rows={3} value={data.bio ?? ""} onChange={(e) => setData({ ...data, bio: e.target.value })} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving}>
          Simpan perubahan
        </Button>
      </div>
    </form>
  );
};
