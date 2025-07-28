import React from "react";
import { BarChart3, Download } from "lucide-react";

export default function Header () {
   return (
       <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-6 py-8 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Laporan & Analitik
              </h1>
              <p className="text-purple-100">
                Analisis data karyawan dan performa perusahaan
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/20">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </button>
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/20">
                <Download className="w-5 h-5" />
                Export All
              </button>
            </div>
          </div>
        </div>
      </div>
   )
}