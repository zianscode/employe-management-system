export interface ProfileData {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tanggalLahir: string;
  alamat: string;
  idKaryawan: string;
  departemen: string;
  jabatan: string;
  tanggalBergabung: string;
  // New Onboarding Fields
  tempatLahir?: string;
  jenisKelamin?: string;
  nik?: string;
  npwp?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolderName?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  education?: string;
  skills?: string;
  bio?: string;
  avatar?: string;
}

export type ProfileTabId = "profil" | "keamanan" | "preferensi" | "aktivitas";

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPreferences {
  bahasa: string;
  zonaWaktu: string;
  formatTanggal: string;
  itemPerHalaman: string;
}

export interface ActivityLogEntry {
  aktivitas: string;
  waktu: string;
  ipAddress: string;
  device: string;
}
