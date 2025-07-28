"use client"

import React, { useState } from 'react';
import { User, Shield, Settings, Activity, Eye, EyeOff, Camera, Save, Check, Globe, Clock, Monitor, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    namaLengkap: 'Admin User',
    email: 'admin@company.com',
    nomorTelepon: '+62 812-3456-7890',
    tanggalLahir: '1990-01-15',
    alamat: 'Jl. Sudirman No. 123, Jakarta Selatan 12190',
    idKaryawan: 'ADM001',
    departemen: 'IT Administration',
    jabatan: 'System Administrator',
    tanggalBergabung: '2023-01-01'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    bahasa: 'Bahasa Indonesia',
    zonaWaktu: 'Asia/Jakarta (WIB)',
    formatTanggal: 'DD/MM/YYYY',
    itemPerHalaman: '10'
  });

  const activityLogs = [
    { aktivitas: 'Login ke sistem', waktu: '15/1/2024, 09.30.00', ipAddress: '192.168.1.100', device: 'Chrome on Windows' },
    { aktivitas: 'Update profil karyawan', waktu: '15/1/2024, 09.15.00', ipAddress: '192.168.1.100', device: 'Chrome on Windows' },
    { aktivitas: 'Export laporan absensi', waktu: '15/1/2024, 08.45.00', ipAddress: '192.168.1.100', device: 'Chrome on Windows' },
    { aktivitas: 'Approve permohonan cuti', waktu: '14/1/2024, 16.20.00', ipAddress: '192.168.1.100', device: 'Chrome on Windows' },
    { aktivitas: 'Login ke sistem', waktu: '14/1/2024, 08.30.00', ipAddress: '192.168.1.100', device: 'Chrome on Windows' }
  ];

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'keamanan', label: 'Keamanan', icon: Shield },
    { id: 'preferensi', label: 'Preferensi', icon: Settings },
    { id: 'aktivitas', label: 'Aktivitas', icon: Activity }
  ];

  const handleProfileUpdate = () => {
    // Handle profile update logic
    console.log('Updating profile:', profileData);
  };

  const handlePasswordUpdate = () => {
    // Handle password update logic
    console.log('Updating password');
  };

  const handlePreferencesUpdate = () => {
    // Handle preferences update logic
    console.log('Updating preferences:', preferences);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] p-8 rounded-2xl text-white">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                    AU
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-white text-[#6700A3] p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Admin User</h2>
                  <p className="text-white/80 mb-1">Super Administrator</p>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Aktif</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-[#E02F75]" size={24} />
                Informasi Pribadi
              </h3>
              <p className="text-gray-600 mb-6">Update informasi profil dan data pribadi Anda</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.namaLengkap}
                    onChange={(e) => setProfileData({...profileData, namaLengkap: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Karyawan</label>
                  <input
                    type="text"
                    value={profileData.idKaryawan}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departemen</label>
                  <input
                    type="text"
                    value={profileData.departemen}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={profileData.nomorTelepon}
                    onChange={(e) => setProfileData({...profileData, nomorTelepon: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                  <input
                    type="text"
                    value={profileData.jabatan}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={profileData.tanggalLahir}
                    onChange={(e) => setProfileData({...profileData, tanggalLahir: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={profileData.tanggalBergabung}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    value={profileData.alamat}
                    onChange={(e) => setProfileData({...profileData, alamat: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleProfileUpdate}
                  className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Save size={20} />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        );

      case 'keamanan':
        return (
          <div className="space-y-8">
            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="text-[#E02F75]" size={24} />
                Ubah Password
              </h3>
              <p className="text-gray-600 mb-6">Update password untuk keamanan akun Anda</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Masukkan password saat ini"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Masukkan password baru"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Konfirmasi password baru"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Persyaratan Password:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Minimal 8 karakter</li>
                    <li>• Mengandung huruf besar dan kecil</li>
                    <li>• Mengandung angka</li>
                    <li>• Mengandung karakter khusus (!@#$%^&*)</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePasswordUpdate}
                    className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Shield size={20} />
                    Ubah Password
                  </button>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Keamanan</h3>
              <p className="text-gray-600 mb-6">Status keamanan akun Anda</p>

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

      case 'preferensi':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="text-[#E02F75]" size={24} />
              Preferensi Aplikasi
            </h3>
            <p className="text-gray-600 mb-6">Sesuaikan pengalaman penggunaan aplikasi</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe size={18} />
                  Bahasa
                </label>
                <select
                  value={preferences.bahasa}
                  onChange={(e) => setPreferences({...preferences, bahasa: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white"
                >
                  <option>Bahasa Indonesia</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  Zona Waktu
                </label>
                <select
                  value={preferences.zonaWaktu}
                  onChange={(e) => setPreferences({...preferences, zonaWaktu: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white"
                >
                  <option>Asia/Jakarta (WIB)</option>
                  <option>Asia/Makassar (WITA)</option>
                  <option>Asia/Jayapura (WIT)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={18} />
                  Format Tanggal
                </label>
                <select
                  value={preferences.formatTanggal}
                  onChange={(e) => setPreferences({...preferences, formatTanggal: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white"
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2">Item per Halaman</label>
                <select
                  value={preferences.itemPerHalaman}
                  onChange={(e) => setPreferences({...preferences, itemPerHalaman: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white"
                >
                  <option>5</option>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handlePreferencesUpdate}
                  className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Save size={20} />
                  Simpan Preferensi
                </button>
              </div>
            </div>
          </div>
        );

      case 'aktivitas':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="text-[#E02F75]" size={24} />
              Log Aktivitas
            </h3>
            <p className="text-gray-600 mb-6">Riwayat aktivitas dan akses sistem Anda</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aktivitas</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Waktu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activityLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{log.aktivitas}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.waktu}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Monitor size={16} />
                        {log.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] p-8 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Profil Saya</h1>
          <p className="text-white/80 text-lg">Kelola informasi profil dan pengaturan akun</p>
        </div>
      </div>

      <div className="py-6 mt-5">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 -mt-16">
          <div className="flex flex-wrap border-b border-gray-100">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#E02F75] text-[#E02F75] bg-[#E02F75]/5'
                      : 'border-transparent text-gray-600 hover:text-[#E02F75] hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}