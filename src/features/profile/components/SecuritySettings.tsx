import React from "react";
import { Shield, Eye, EyeOff, Check } from "lucide-react";
import { PasswordData } from "@/shared/types/profile.types";

interface SecuritySettingsProps {
  data: PasswordData;
  setData: (data: PasswordData) => void;
  showCurrent: boolean;
  setShowCurrent: (v: boolean) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  onUpdate: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  data,
  setData,
  showCurrent,
  setShowCurrent,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="text-[#E02F75]" size={20} />
          Ubah Password
        </h3>
        <div className="space-y-6">
          {(
            [
              { label: "Password Saat Ini", key: "currentPassword", show: showCurrent, toggle: setShowCurrent },
              { label: "Password Baru", key: "newPassword", show: showNew, toggle: setShowNew },
              { label: "Konfirmasi Password Baru", key: "confirmPassword", show: showConfirm, toggle: setShowConfirm },
            ] as const
          ).map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? "text" : "password"}
                  value={data[field.key]}
                  onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => field.toggle(!field.show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {field.show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          ))}
          {data.newPassword.length > 0 && (
            (() => {
              const reqs = [
                { label: "Minimal 8 karakter", met: data.newPassword.length >= 8 },
                { label: "Mengandung huruf besar dan kecil", met: /[a-z]/.test(data.newPassword) && /[A-Z]/.test(data.newPassword) },
                { label: "Mengandung angka", met: /\d/.test(data.newPassword) },
                { label: "Mengandung karakter khusus (!@#$%^&*)", met: /[!@#$%^&*]/.test(data.newPassword) },
              ];
              const unmetReqs = reqs.filter(r => !r.met);
              
              if (unmetReqs.length === 0) return null;

              return (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-1 duration-300">
                  <h4 className="font-bold text-blue-900 mb-2">Persyaratan Password:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {unmetReqs.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()
          )}

          <div className="flex justify-end">
            <button
              onClick={onUpdate}
              className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Shield size={20} />
              Ubah Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Informasi Keamanan</h3>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-full">
              <Check className="text-white" size={16} />
            </div>
            <div>
              <p className="font-medium text-green-800">Two-Factor Authentication</p>
              <p className="text-sm text-green-600">Aktif sejak 15 Jan 2024</p>
            </div>
            <div className="ml-auto">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
