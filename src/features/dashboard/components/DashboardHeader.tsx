"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

const DashboardHeader = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-2xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ringkasan Dashboard</h1>
          <p className="text-white/80 text-sm font-medium">Selamat datang kembali, {firstName}! Pantau performa tim Anda hari ini.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
            <input
              type="text"
              placeholder="Cari sesuatu..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/30 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-white rounded-full border border-[#E02F75] animate-pulse"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
