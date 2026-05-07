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
