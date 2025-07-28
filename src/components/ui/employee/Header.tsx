import { Plus } from "lucide-react";

export default function Header() {
   return (
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] px-8 py-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manajemen Karyawan
            </h1>
            <p className="text-pink-100">Kelola data karyawan perusahaan</p>
          </div>
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-200 flex items-center gap-2 border border-white/30">
            <Plus size={20} />
            Tambah Karyawan
          </button>
        </div>
      </div>
   )
}