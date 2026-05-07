import { useState } from "react";
import { ProfileData, PasswordData, UserPreferences, ActivityLogEntry, ProfileTabId } from "../../domain/entities/profile";

export function useProfile() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("profil");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    namaLengkap: "Admin User",
    email: "admin@company.com",
    nomorTelepon: "+62 812-3456-7890",
    tanggalLahir: "1990-01-15",
    alamat: "Jl. Sudirman No. 123, Jakarta Selatan 12190",
    idKaryawan: "ADM001",
    departemen: "IT Administration",
    jabatan: "System Administrator",
    tanggalBergabung: "2023-01-01",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    bahasa: "Bahasa Indonesia",
    zonaWaktu: "Asia/Jakarta (WIB)",
    formatTanggal: "DD/MM/YYYY",
    itemPerHalaman: "10",
  });

  const activityLogs: ActivityLogEntry[] = [
    { aktivitas: "Login ke sistem", waktu: "15/1/2024, 09.30.00", ipAddress: "192.168.1.100", device: "Chrome on Windows" },
    { aktivitas: "Update profil karyawan", waktu: "15/1/2024, 09.15.00", ipAddress: "192.168.1.100", device: "Chrome on Windows" },
    { aktivitas: "Export laporan absensi", waktu: "15/1/2024, 08.45.00", ipAddress: "192.168.1.100", device: "Chrome on Windows" },
    { aktivitas: "Approve permohonan cuti", waktu: "14/1/2024, 16.20.00", ipAddress: "192.168.1.100", device: "Chrome on Windows" },
    { aktivitas: "Login ke sistem", waktu: "14/1/2024, 08.30.00", ipAddress: "192.168.1.100", device: "Chrome on Windows" },
  ];

  return {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    preferences,
    setPreferences,
    activityLogs,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
}
