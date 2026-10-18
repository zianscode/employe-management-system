import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ProfileData, PasswordData, UserPreferences, ActivityLogEntry, ProfileTabId } from "@/shared/types/profile.types";
import { getProfileAction, updateProfileAction, updatePasswordAction, updatePreferencesAction } from "@/server/modules/profile/profile.actions";

export function useProfile() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("profil");
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { update } = useSession();

  const [profileData, setProfileData] = useState<ProfileData>({
    namaLengkap: "",
    email: "",
    nomorTelepon: "",
    tanggalLahir: "",
    alamat: "",
    idKaryawan: "",
    departemen: "",
    jabatan: "",
    tanggalBergabung: "",
    tempatLahir: "",
    jenisKelamin: "",
    nik: "",
    npwp: "",
    bankName: "",
    bankAccount: "",
    bankHolderName: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    education: "",
    skills: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await getProfileAction();
      if (res.success) {
        setProfileData(res.data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    const res = await updateProfileAction(profileData);
    if (res.success) {
      // Update session to reflect new name/avatar in sidebar
      await update({
        name: profileData.namaLengkap,
        image: profileData.avatar,
        picture: profileData.avatar
      });
      toast.success("Profil berhasil diperbarui!");
    } else {
      toast.error("Gagal memperbarui profil: " + res.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }
    const res = await updatePasswordAction(passwordData);
    if (res.success) {
      toast.success("Password berhasil diperbarui!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error("Gagal memperbarui password: " + res.message);
    }
  };

  const handleUpdatePreferences = async () => {
    const res = await updatePreferencesAction(preferences);
    if (res.success) {
      toast.success("Pengaturan preferensi berhasil disimpan!");
    } else {
      toast.error("Gagal memperbarui preferensi: " + res.message);
    }
  };

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
    { aktivitas: "Memperbarui Profil", waktu: new Date().toLocaleString(), ipAddress: "182.1.xxx.xxx", device: "Chrome on Windows" },
    { aktivitas: "Login ke sistem", waktu: new Date(Date.now() - 3600000).toLocaleString(), ipAddress: "182.1.xxx.xxx", device: "Chrome on Windows" },
    { aktivitas: "Absensi Masuk", waktu: new Date(Date.now() - 86400000).toLocaleString(), ipAddress: "182.1.xxx.xxx", device: "Chrome on Windows" },
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
    loading,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleUpdateProfile,
    handleUpdatePassword,
    handleUpdatePreferences,
  };
}
