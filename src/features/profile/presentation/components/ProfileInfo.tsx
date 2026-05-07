import React from "react";
import { User, Camera, Save } from "lucide-react";
import { ProfileData } from "../../domain/entities/profile";

interface ProfileInfoProps {
  data: ProfileData;
  setData: (data: ProfileData) => void;
  onSave: () => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ data, setData, onSave }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
              AU
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white text-[#6700A3] p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{data.namaLengkap}</h2>
            <p className="text-white/80 mb-1">{data.jabatan}</p>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Aktif</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="text-[#E02F75]" size={20} />
          Informasi Pribadi
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(
            [
              { label: "Nama Lengkap", key: "namaLengkap" },
              { label: "ID Karyawan", key: "idKaryawan", disabled: true },
              { label: "Email", key: "email" },
              { label: "Departemen", key: "departemen", disabled: true },
              { label: "Nomor Telepon", key: "nomorTelepon" },
              { label: "Jabatan", key: "jabatan", disabled: true },
              { label: "Tanggal Lahir", key: "tanggalLahir", type: "date" },
              { label: "Tanggal Bergabung", key: "tanggalBergabung", type: "date", disabled: true },
            ] as { label: string; key: keyof ProfileData; disabled?: boolean; type?: string }[]
          ).map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <input
                type={field.type || "text"}
                value={data[field.key]}
                disabled={field.disabled}
                onChange={(e) => !field.disabled && setData({ ...data, [field.key]: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all ${
                  field.disabled ? "bg-gray-50 text-gray-500" : ""
                }`}
              />
            </div>
          ))}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              value={data.alamat}
              onChange={(e) => setData({ ...data, alamat: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
