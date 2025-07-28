import { Calendar, Mail, Briefcase, Building } from "lucide-react";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-600 text-sm font-medium">Total Karyawan</p>
            <p className="text-2xl font-bold text-pink-800">5</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Briefcase className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Aktif</p>
            <p className="text-2xl font-bold text-green-800">3</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Building className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-600 text-sm font-medium">Cuti</p>
            <p className="text-2xl font-bold text-yellow-800">1</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-600 text-sm font-medium">Non-Aktif</p>
            <p className="text-2xl font-bold text-red-800">1</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
