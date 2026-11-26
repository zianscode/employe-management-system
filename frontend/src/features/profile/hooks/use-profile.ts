import { useState, useEffect } from "react";
import { useSession } from "@/lib/api/session";
import { toast } from "sonner";
import { ProfileData, PasswordData, ProfileTabId } from "@/shared/types/profile.types";
import { getProfile, updateProfile, updatePassword } from "@/lib/api/client";

const EMPTY_PROFILE: ProfileData = {
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
};

const EMPTY_PASSWORD: PasswordData = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function useProfile() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("profil");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(EMPTY_PROFILE);
  const [passwordData, setPasswordData] = useState<PasswordData>(EMPTY_PASSWORD);
  const { update } = useSession();

  useEffect(() => {
    async function loadProfile() {
      const res = await getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const res = await updateProfile(profileData);
    if (res.success) {
      await update();
      toast.success("Profil disimpan");
    } else {
      toast.error("Gagal menyimpan profil: " + res.message);
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    setIsSaving(true);
    const res = await updatePassword(passwordData);
    if (res.success) {
      toast.success("Password diperbarui");
      setPasswordData(EMPTY_PASSWORD);
    } else {
      toast.error("Gagal memperbarui password: " + res.message);
    }
    setIsSaving(false);
  };

  return {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    loading,
    isSaving,
    handleUpdateProfile,
    handleUpdatePassword,
  };
}
