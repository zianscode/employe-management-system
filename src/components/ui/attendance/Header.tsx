import { Download } from "lucide-react";

export default function Header() {
   return(
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-6 py-8 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manajemen Absensi</h1>
              <p className="text-purple-100">Kelola dan pantau kehadiran karyawan</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/20">
              <Download className="w-5 h-5" />
              Export Data
            </button>
          </div>
        </div>
      </div>
   )
}