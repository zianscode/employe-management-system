import React from "react";

export const ProfileHeader: React.FC = () => {
  return (
    <div className="relative mb-8">
      <div className="h-48 bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] rounded-3xl overflow-hidden shadow-lg relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="absolute inset-0 flex items-center p-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profil Saya</h1>
            <p className="text-white/80 font-medium max-w-lg">
              Kelola informasi pribadi, keamanan akun, dan preferensi notifikasi Anda di sini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
