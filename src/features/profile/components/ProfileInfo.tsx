import React from "react";
import { User, Camera, Save, CreditCard, ShieldAlert, Award, FileText } from "lucide-react";
import { ProfileData } from "@/shared/types/profile.types";
import Image from "next/image";

interface ProfileInfoProps {
  data: ProfileData;
  setData: (data: ProfileData) => void;
  onSave: () => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ data, setData, onSave }) => {
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-8 rounded-[32px] text-white shadow-xl shadow-[#E02F75]/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[40px] border-4 border-white/30 flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
              {data.avatar ? (
                <Image src={data.avatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" unoptimized />
              ) : (
                data.namaLengkap ? data.namaLengkap.split(" ").map(n => n[0]).join("").substring(0, 2) : "SA"
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-white text-[#E02F75] p-2.5 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black mb-2 tracking-tight">{data.namaLengkap}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                {data.idKaryawan && data.idKaryawan !== "-" ? (data.jabatan || "-") : "-"}
              </span>
              <span className="bg-green-500/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                Aktif
              </span>
            </div>
            <p className="mt-4 text-white/70 text-sm font-medium">{data.email}</p>
          </div>
        </div>
      </div>

      {/* Section 0: Employment Data (Read Only) */}
      <div className="bg-white rounded-[32px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 space-y-6 relative overflow-hidden">
        {/* Subtle Accent Line */}
        <div className="absolute top-0 left-0 w-1 bg-gray-300 h-full"></div>
        
        <h3 className="text-lg font-black text-gray-400 flex items-center gap-3 uppercase tracking-widest">
          <div className="p-2 bg-gray-100 rounded-xl">
            <Award className="text-gray-400" size={20} />
          </div>
          Data Kepegawaian (Read Only)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "ID Karyawan", value: data.idKaryawan || "-" },
            { label: "Departemen", value: (data.idKaryawan && data.idKaryawan !== "-") ? (data.departemen || "-") : "-" },
            { label: "Jabatan", value: (data.idKaryawan && data.idKaryawan !== "-") ? (data.jabatan || "-") : "-" },
            { label: "Tanggal Bergabung", value: data.tanggalBergabung || "-" },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-semibold text-sm text-gray-500/80">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="p-2 bg-[#E02F75]/10 rounded-xl">
              <User className="text-[#E02F75]" size={20} />
            </div>
            Informasi Pribadi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Nama Lengkap", key: "namaLengkap" },
              { label: "Email", key: "email" },
              { label: "Nomor Telepon", key: "nomorTelepon" },
              { label: "Jenis Kelamin", key: "jenisKelamin", type: "select", options: ["MALE", "FEMALE"] },
              { label: "Tempat Lahir", key: "tempatLahir" },
              { label: "Tanggal Lahir", key: "tanggalLahir", type: "date" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    value={data[field.key as keyof ProfileData] as string}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#E02F75]/50 focus:bg-white outline-none transition-all font-semibold text-sm"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={data[field.key as keyof ProfileData] as string}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#E02F75]/50 focus:bg-white outline-none transition-all font-semibold text-sm"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
              <textarea
                value={data.alamat}
                onChange={(e) => setData({ ...data, alamat: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#E02F75]/50 focus:bg-white outline-none transition-all font-semibold text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Identity */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <CreditCard className="text-blue-500" size={20} />
            </div>
            Keuangan & Identitas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Nomor KTP (NIK)", key: "nik" },
              { label: "Nomor NPWP", key: "npwp" },
              { label: "Nama Bank", key: "bankName" },
              { label: "Nomor Rekening", key: "bankAccount" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                <input
                  type="text"
                  value={data[field.key as keyof ProfileData] as string}
                  onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500/50 focus:bg-white outline-none transition-all font-semibold text-sm"
                />
              </div>
            ))}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={data.bankHolderName}
                onChange={(e) => setData({ ...data, bankHolderName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500/50 focus:bg-white outline-none transition-all font-semibold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <ShieldAlert className="text-orange-500" size={20} />
            </div>
            Kontak Darurat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Nama Kontak", key: "emergencyName" },
              { label: "Hubungan", key: "emergencyRelation" },
              { label: "Nomor Telepon", key: "emergencyPhone" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                <input
                  type="text"
                  value={data[field.key as keyof ProfileData] as string}
                  onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-orange-500/50 focus:bg-white outline-none transition-all font-semibold text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Professional & Education */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Award className="text-purple-500" size={20} />
            </div>
            Pendidikan & Skill
          </h3>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pendidikan Terakhir</label>
              <textarea
                value={data.education}
                onChange={(e) => setData({ ...data, education: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-purple-500/50 focus:bg-white outline-none transition-all font-semibold text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keahlian (Skills)</label>
              <textarea
                value={data.skills}
                onChange={(e) => setData({ ...data, skills: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-purple-500/50 focus:bg-white outline-none transition-all font-semibold text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Bio */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6 md:col-span-1 xl:col-span-2">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <FileText className="text-green-500" size={20} />
            </div>
            Biodata Singkat
          </h3>
          <textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            rows={4}
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] focus:border-green-500/50 focus:bg-white outline-none transition-all font-semibold text-sm resize-none"
          />
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          className="bg-gradient-to-r from-[#FF5A57] to-[#E02F75] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#E02F75]/20 hover:shadow-2xl hover:shadow-[#E02F75]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Save size={20} />
          Simpan Seluruh Perubahan
        </button>
      </div>
    </div>
  );
};
