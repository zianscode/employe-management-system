import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, User, Briefcase, Building2, Calendar, 
  Phone, MapPin, CreditCard, ShieldAlert, BookOpen, Award, FileText, Compass
} from "lucide-react";
import { getEmployeeByIdAction } from "@/server/modules/employees/employee.actions";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatCurrency } from "@/shared/utils/format";
import { getProbationDaysLeft } from "@/shared/utils/employee";

interface FullEmployeeDetails {
  id: string;
  name: string;
  email: string;
  nip: string;
  joinDate: string;
  status: string;
  employmentType: string;
  salaryBase: number;
  leaveQuota: number;
  division: string;
  position: string;
  avatar?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  placeOfBirth?: string;
  identityNumber?: string;
  bio?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolderName?: string;
  npwpNumber?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  education?: string;
  skills?: string;
}

const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-purple-600",
    "from-purple-500 to-indigo-600",
    "from-indigo-500 to-blue-600",
    "from-blue-500 to-cyan-600",
    "from-cyan-500 to-teal-600",
  ];
  const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[charCodeSum % gradients.length];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const res = await getEmployeeByIdAction(resolvedParams.id);

  if (!res.success || !res.data) {
    notFound();
  }

  const employee = res.data as unknown as FullEmployeeDetails;

  let probationText = null;
  if (employee.status === "PROBATION" && employee.joinDate) {
    const daysLeft = getProbationDaysLeft(employee.joinDate);
    probationText = daysLeft <= 0 ? "Selesai Masa Percobaan" : `Masa Percobaan (${daysLeft} hari lagi)`;
  }

  const formattedBirthDate = employee.birthDate 
    ? new Date(employee.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : "-";

  const formattedJoinDate = employee.joinDate
    ? new Date(employee.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : "-";

  const genderText = employee.gender === "MALE" ? "Laki-laki" : employee.gender === "FEMALE" ? "Perempuan" : "-";

  const skillsArray = employee.skills ? employee.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="py-6 pl-8 pr-6 space-y-6">
      <div>
        <Link 
          href="/dashboard/employees"
          className="flex items-center gap-2 text-gray-500 hover:text-[#E02F75] transition-colors group w-fit"
        >
          <div className="p-2 rounded-xl bg-white border border-gray-100 group-hover:bg-[#E02F75]/10 group-hover:border-[#E02F75]/20 shadow-sm transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="font-bold text-sm">Kembali ke Daftar Karyawan</span>
        </Link>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A57]/5 via-[#E02F75]/5 to-[#6700A3]/5 pointer-events-none"></div>
        <div className="px-8 py-10 sm:px-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className={`w-32 h-32 rounded-[32px] bg-gradient-to-br ${getAvatarGradient(employee.name)} flex items-center justify-center text-white text-4xl font-black shadow-lg border-4 border-white relative overflow-hidden flex-shrink-0`}>
            {employee.avatar ? (
              <Image 
                src={employee.avatar} 
                alt={employee.name} 
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <span className="relative z-10">
                {employee.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{employee.name}</h1>
                <StatusBadge status={employee.status} />
                {probationText && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    probationText === "Selesai Masa Percobaan" 
                      ? "bg-red-50 text-red-600 border-red-100" 
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {probationText}
                  </span>
                )}
              </div>
              <p className="text-gray-500 font-semibold text-sm">{employee.email}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-3 gap-x-6 text-sm text-gray-600 font-semibold">
              <span className="flex items-center gap-2">
                <Briefcase size={16} className="text-[#E02F75]" />
                {employee.position}
              </span>
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-[#E02F75]" />
                Divisi {employee.division}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-[#E02F75]" />
                NIP: {employee.nip}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-pink-50 text-[#E02F75] rounded-xl">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Detail Pekerjaan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Status Karyawan" icon={FileText}>
                <span className="capitalize font-semibold">{employee.status.toLowerCase()}</span>
              </DetailItem>
              <DetailItem label="Tipe Pekerjaan" icon={Building2}>
                <span className="font-semibold">{employee.employmentType.replace("_", " ")}</span>
              </DetailItem>
              <DetailItem label="Tanggal Bergabung" icon={Calendar}>
                <span>{formattedJoinDate}</span>
              </DetailItem>
              <DetailItem label="Kuota Cuti Tahunan" icon={Calendar}>
                <span className="font-bold text-gray-900">{employee.leaveQuota} Hari</span>
              </DetailItem>
              <DetailItem label="Gaji Pokok Dasar" icon={CreditCard}>
                <span className="font-bold text-gray-900">{formatCurrency(employee.salaryBase || 0)}</span>
              </DetailItem>
              <DetailItem label="ID Karyawan" icon={User}>
                <span className="font-mono text-xs select-all text-gray-500">{employee.id}</span>
              </DetailItem>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Informasi Pribadi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="NIK (KTP)" icon={CreditCard}>
                <span className="font-semibold text-gray-800">{employee.identityNumber || "-"}</span>
              </DetailItem>
              <DetailItem label="Jenis Kelamin" icon={User}>
                <span>{genderText}</span>
              </DetailItem>
              <DetailItem label="Nomor Telepon" icon={Phone}>
                <span>{employee.phone || "-"}</span>
              </DetailItem>
              <DetailItem label="Tempat / Tanggal Lahir" icon={Calendar}>
                <span>{employee.placeOfBirth ? `${employee.placeOfBirth}, ` : ""}{formattedBirthDate}</span>
              </DetailItem>
              <DetailItem label="Alamat Lengkap" icon={MapPin} className="md:col-span-2">
                <span className="leading-relaxed">{employee.address || "-"}</span>
              </DetailItem>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Pendidikan & Bio</h3>
            </div>

            <div className="space-y-4">
              <DetailItem label="Riwayat Pendidikan" icon={Award}>
                <span className="leading-relaxed text-gray-800 font-medium block mt-1">{employee.education || "-"}</span>
              </DetailItem>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Keahlian (Skills)</span>
                {skillsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillsArray.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">-</span>
                )}
              </div>

              <DetailItem label="Biodata Singkat" icon={Compass}>
                <p className="text-sm text-gray-600 leading-relaxed italic bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 mt-1">
                  {employee.bio || "Tidak ada biografi singkat."}
                </p>
              </DetailItem>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Keuangan & Kontak Darurat</h3>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Akun Finansial</span>
                <div className="text-xs space-y-1.5 text-gray-700 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank:</span>
                    <span>{employee.bankName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">No Rekening:</span>
                    <span className="font-mono">{employee.bankAccount || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Atas Nama:</span>
                    <span className="truncate max-w-[150px]">{employee.bankHolderName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">NPWP:</span>
                    <span className="font-mono">{employee.npwpNumber || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-pink-50/50 border border-pink-100/50 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E02F75] block">Hubungan Darurat</span>
                <div className="text-xs space-y-1.5 text-gray-700 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Kontak:</span>
                    <span>{employee.emergencyName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Relasi:</span>
                    <span>{employee.emergencyRelation || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telepon:</span>
                    <span>{employee.emergencyPhone || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const DetailItem = ({ label, icon: Icon, children, className = "" }: DetailItemProps) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <Icon size={12} className="text-gray-400" />
        {label}
      </span>
      <div className="text-sm font-semibold text-gray-800">{children}</div>
    </div>
  );
};
