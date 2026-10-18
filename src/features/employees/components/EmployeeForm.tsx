"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Briefcase, Building2, Calendar, Shield, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeStatus } from "@prisma/client";

import { getOrgData } from "@/server/modules/employees/organization.actions";
import { getRolesAction } from "@/server/modules/employees/employee.actions";
import { EmployeeFormData } from "@/shared/types/employee.types";

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>; 
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  title: string;
  isSubmitting?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  title,
  isSubmitting = false,
}) => {
  const router = useRouter();
  const [orgData, setOrgData] = useState<{ 
    departments: { id: string; name: string }[], 
    positions: { id: string; name: string }[],
    roles: { id: string; name: string }[]
  }>({
    departments: [],
    positions: [],
    roles: []
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    nip: initialData?.nip || "",
    gender: initialData?.gender || "MALE",
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split("T")[0] : "",
    positionId: initialData?.positionId || "",
    departmentId: initialData?.departmentId || "",
    roleId: initialData?.roleId || "",
    status: (initialData?.status as EmployeeStatus) || "ACTIVE",
    employmentType: initialData?.employmentType || "FULL_TIME",
    joinDate: initialData?.joinDate || new Date().toISOString().split("T")[0],
    customPosition: "",
  });

  // Auto-generate NIP Logic
  useEffect(() => {
    if (!initialData?.nip && formData.birthDate && formData.joinDate && formData.gender) {
      const bDate = formData.birthDate.replace(/-/g, ""); // YYYYMMDD
      const jDate = formData.joinDate.replace(/-/g, "").substring(0, 6); // YYYYMM
      const genderCode = formData.gender === "MALE" ? "1" : "2";
      
      // For sequence, in a real app we'd fetch from DB, here we'll use a placeholder or just 001 for new
      const sequence = "001"; 
      
      const generatedNip = `${bDate}${jDate}${genderCode}${sequence}`;
      setFormData(prev => ({ ...prev, nip: generatedNip }));
    }
  }, [formData.birthDate, formData.joinDate, formData.gender, initialData?.nip]);

  // Auto-link Position to Department (Division)
  useEffect(() => {
    if (formData.positionId && formData.positionId !== "OTHER") {
      const selectedPos = orgData.positions.find(p => p.id === formData.positionId);
      if (selectedPos) {
        const mapping: Record<string, string> = {
          "Chief Executive Officer": "Direksi",
          "Lead Developer": "Teknologi Informasi",
          "HR Manager": "Sumber Daya Manusia",
        };
        const targetDeptName = mapping[selectedPos.name];
        if (targetDeptName) {
          const targetDept = orgData.departments.find(d => d.name === targetDeptName);
          if (targetDept) {
            setFormData(prev => ({ ...prev, departmentId: targetDept.id }));
          }
        }
      }
    }
  }, [formData.positionId, orgData.positions, orgData.departments]);

  useEffect(() => {
    const fetchOrgData = async () => {
      const data = await getOrgData() as { 
        departments: { id: string; name: string }[], 
        positions: { id: string; name: string }[] 
      };
      const rolesRes = await getRolesAction();
      const rolesData = rolesRes.success ? rolesRes.data : [];
      
      setOrgData({ ...data, roles: rolesData });
      
      // If creating new and data exists, set default IDs
      if (!initialData) {
        const empRole = rolesData.find((r: { name: string; id: string }) => r.name === "EMPLOYEE");
        if (empRole) setFormData(prev => ({ ...prev, roleId: empRole.id }));
      }
    };
    fetchOrgData();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData });
  };

  return (
    <div className="w-full">
      {/* Top Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-[#E02F75] transition-colors mb-6 group"
      >
        <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-[#E02F75]/10 transition-all">
          <ArrowLeft size={18} />
        </div>
        <span className="font-bold text-sm">Kembali</span>
      </button>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="px-10 py-8 bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{title}</h1>
              <p className="text-white/70 text-sm font-medium">Lengkapi informasi detail karyawan Anda</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Section 1: Personal Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Informasi Pribadi</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Kantor</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="budi@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Jenis Kelamin</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">NIP (Auto-Generated)</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="nip"
                    readOnly
                    value={formData.nip}
                    placeholder="NIP akan terisi otomatis..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-500 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Job Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Detail Pekerjaan</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Jabatan</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <select
                    name="positionId"
                    required
                    value={formData.positionId}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="" disabled>Pilih Jabatan</option>
                    {orgData.positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    <option value="OTHER">Lainnya...</option>
                  </select>
                </div>
              </div>

              {formData.positionId === "OTHER" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-[#E02F75] ml-1">Nama Jabatan Kustom</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E02F75]" size={20} />
                    <input
                      type="text"
                      name="customPosition"
                      required
                      value={formData.customPosition}
                      onChange={handleChange}
                      placeholder="Masukkan nama jabatan baru..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E02F75]/30 rounded-2xl focus:border-[#E02F75] outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tipe Pekerjaan</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <select
                    name="employmentType"
                    required
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="REMOTE">Remote</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Hak Akses (Role)</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <select
                    name="roleId"
                    required
                    value={formData.roleId}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 focus:ring-4 focus:ring-[#E02F75]/5 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="" disabled>Pilih Hak Akses</option>
                    {orgData.roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Role Description Note */}
                {formData.roleId && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cakupan Akses:</p>
                    <p className="text-[11px] font-medium text-gray-600">
                      {orgData.roles.find(r => r.id === formData.roleId)?.name === "SUPER_ADMIN" && "Kendali penuh seluruh fitur sistem dan pengaturan."}
                      {orgData.roles.find(r => r.id === formData.roleId)?.name === "HR" && "Mengelola data karyawan, penggajian, dan persetujuan akhir."}
                      {orgData.roles.find(r => r.id === formData.roleId)?.name === "MANAGER" && "Melihat tim dan menyetujui permohonan absensi/cuti."}
                      {orgData.roles.find(r => r.id === formData.roleId)?.name === "EMPLOYEE" && "Akses dasar untuk dashboard pribadi dan pengajuan mandiri."}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Divisi</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium cursor-pointer"
                    >
                      <option value="" disabled>Pilih Divisi</option>
                      {orgData.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="PROBATION">Probation</option>
                    <option value="RESIGNED">Resign</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tanggal Bergabung</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E02F75] transition-colors" size={20} />
                  <input
                    type="date"
                    name="joinDate"
                    required
                    value={formData.joinDate}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E02F75]/50 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4 border-t border-gray-50 pt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Daftarkan Karyawan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
