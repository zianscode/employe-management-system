"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Users,
  Shield,
  Bell,
  Database,
  Key,
  Mail,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Crown,
  UserCheck,
  DollarSign
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    autoBackup: true,
    dataRetention: true,
    twoFactor: false,
    forcePasswordChange: true,
    apiRateLimit: true,
    newEmployee: true,
    leaveRequest: true,
    monthlyReport: false,
    backupComplete: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const tabs = [
    { id: "general", label: "Umum", icon: Settings },
    { id: "company", label: "Perusahaan", icon: Building2 },
    { id: "users", label: "Pengguna", icon: Users },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "notifications", label: "Notifikasi", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] p-6 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Pengaturan Sistem
              </h1>
              <p className="text-white/80 mt-1">
                Kelola konfigurasi dan preferensi sistem
              </p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/20">
              Simpan Semua
            </button>
          </div>
        </div>
      </div>

      <div className="py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-[#6700A3] shadow-sm"
                    : "text-gray-600 hover:text-[#6700A3]"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* General Settings */}
          {activeTab === "general" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pengaturan Aplikasi
                    </h3>
                    <p className="text-gray-500">Konfigurasi dasar aplikasi</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Aplikasi
                    </label>
                    <input
                      type="text"
                      defaultValue="Employee Management System"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versi Aplikasi
                    </label>
                    <input
                      type="text"
                      defaultValue="1.0.0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Waktu
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent">
                      <option>Asia/Jakarta (WIB)</option>
                      <option>Asia/Makassar (WITA)</option>
                      <option>Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bahasa
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent">
                      <option>Bahasa Indonesia</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
                    <Database className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pengaturan Data
                    </h3>
                    <p className="text-gray-500">
                      Konfigurasi penyimpanan dan backup
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto Backup</h4>
                      <p className="text-sm text-gray-500">
                        Backup otomatis setiap hari
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("autoBackup")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.autoBackup ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.autoBackup
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Data Retention
                      </h4>
                      <p className="text-sm text-gray-500">
                        Simpan data selama 7 tahun
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("dataRetention")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.dataRetention ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.dataRetention
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu Backup
                    </label>
                    <input
                      type="time"
                      defaultValue="02:00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ukuran File Maksimal (MB)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Company Settings */}
          {activeTab === "company" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
                    <Building2 className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Informasi Perusahaan
                    </h3>
                    <p className="text-gray-500">
                      Data dan identitas perusahaan
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      defaultValue="PT. Teknologi Maju Bersama"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Perusahaan
                    </label>
                    <input
                      type="text"
                      defaultValue="TMB"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NPWP
                    </label>
                    <input
                      type="text"
                      defaultValue="01.234.567.8-901.000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telepon
                    </label>
                    <input
                      type="text"
                      defaultValue="+62 21 1234 5678"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pengaturan Kerja
                    </h3>
                    <p className="text-gray-500">
                      Konfigurasi jam kerja dan hari libur
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Masuk
                      </label>
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Pulang
                      </label>
                      <input
                        type="time"
                        defaultValue="17:00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi Istirahat (menit)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Lembur (%)
                      </label>
                      <input
                        type="number"
                        defaultValue="150"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuti Tahunan
                      </label>
                      <input
                        type="number"
                        defaultValue="12"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Keamanan Login
                    </h3>
                    <p className="text-gray-500">
                      Pengaturan keamanan akses sistem
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500">
                        Aktifkan 2FA untuk keamanan ekstra
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("twoFactor")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.twoFactor ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.twoFactor
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Force Password Change
                      </h4>
                      <p className="text-sm text-gray-500">
                        Wajib ganti password setiap 90 hari
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("forcePasswordChange")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.forcePasswordChange
                          ? "bg-[#6700A3]"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.forcePasswordChange
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (menit)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimal Percobaan Login
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
                    <Key className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      API & Integrasi
                    </h3>
                    <p className="text-gray-500">
                      Pengaturan API dan integrasi eksternal
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        defaultValue="••••••••••••••••"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                        readOnly
                      />
                      <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        👁️
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        API Rate Limiting
                      </h4>
                      <p className="text-sm text-gray-500">
                        Batasi request per menit
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("apiRateLimit")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.apiRateLimit ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.apiRateLimit
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (per menit)
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-[#FF5A57] to-[#E02F75] text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                    Generate New API Key
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-gray-500">Pengaturan notifikasi email</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Karyawan Baru
                      </h4>
                      <p className="text-sm text-gray-500">
                        Notifikasi saat ada karyawan baru
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("newEmployee")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.newEmployee ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.newEmployee
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Permohonan Cuti
                      </h4>
                      <p className="text-sm text-gray-500">
                        Notifikasi permohonan cuti
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("leaveRequest")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.leaveRequest ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.leaveRequest
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Laporan Bulanan
                      </h4>
                      <p className="text-sm text-gray-500">
                        Kirim laporan setiap bulan
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("monthlyReport")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.monthlyReport ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.monthlyReport
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Backup Selesai
                      </h4>
                      <p className="text-sm text-gray-500">
                        Notifikasi backup berhasil
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle("backupComplete")}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.backupComplete ? "bg-[#6700A3]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          settings.backupComplete
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
                    <Bell className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      System Notifications
                    </h3>
                    <p className="text-gray-500">
                      Pengaturan notifikasi sistem
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@company.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      defaultValue="••••••••"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6700A3] focus:border-transparent"
                    />
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                    Test Email Configuration
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Users Management */}
          {activeTab === "users" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-xl flex items-center justify-center">
                      <Users className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Manajemen Pengguna Sistem
                      </h3>
                      <p className="text-gray-500">
                        Kelola akses dan peran pengguna sistem
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Tambah Pengguna</span>
                  </button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Pengguna
                        </th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Email
                        </th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Peran
                        </th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Login Terakhir
                        </th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-gray-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#FF5A57] to-[#E02F75] rounded-lg flex items-center justify-center text-white font-medium text-sm">
                              AU
                            </div>
                            <span className="font-medium text-gray-900">
                              Admin User
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          admin@company.com
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Super Admin
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Aktif
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600 text-sm">
                          2024-01-15 09:30
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-[#6700A3] transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-lg flex items-center justify-center text-white font-medium text-sm">
                              HM
                            </div>
                            <span className="font-medium text-gray-900">
                              HR Manager
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          hr@company.com
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            HR Admin
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Aktif
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600 text-sm">
                          2024-01-15 08:45
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-[#6700A3] transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6700A3] to-[#FF5A57] rounded-lg flex items-center justify-center text-white font-medium text-sm">
                              FA
                            </div>
                            <span className="font-medium text-gray-900">
                              Finance Admin
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          finance@company.com
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Finance Admin
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Aktif
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600 text-sm">
                          2024-01-14 17:20
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-[#6700A3] transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Permissions & Roles */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E02F75] to-[#6700A3] rounded-xl flex items-center justify-center">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Peran & Izin
                    </h3>
                    <p className="text-gray-500">
                      Kelola peran pengguna dan izin akses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Crown className="text-red-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Super Admin
                        </h4>
                        <p className="text-sm text-gray-500">
                          Akses penuh sistem
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Manajemen Pengguna</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Pengaturan Sistem</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Laporan & Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Backup & Restore</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          HR Admin
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manajemen karyawan
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Data Karyawan</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Absensi & Cuti</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <X className="text-red-500" size={12} />
                        <span>Pengaturan Sistem</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Laporan HR</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-green-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Finance Admin
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manajemen keuangan
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Data Gaji</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-500" size={12} />
                        <span>Laporan Keuangan</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <X className="text-red-500" size={12} />
                        <span>Pengaturan Sistem</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <X className="text-red-500" size={12} />
                        <span>Data Karyawan</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                    Tambah Peran Baru
                  </button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Kelola Izin
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
