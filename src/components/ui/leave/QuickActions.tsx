import React from "react";
import { Calendar, CheckCircle, FileText } from "lucide-react";

export default function QuickAction() {
   return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold mb-1">Setujui Semua</h3>
                <p className="text-green-100 text-sm">
                  Setujui semua cuti pending
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </button>

          <button className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold mb-1">Laporan Bulanan</h3>
                <p className="text-blue-100 text-sm">
                  Unduh laporan cuti bulan ini
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </button>

          <button className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold mb-1">Pengaturan</h3>
                <p className="text-purple-100 text-sm">
                  Kelola aturan cuti karyawan
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-200" />
            </div>
          </button>
        </div>
   )
}