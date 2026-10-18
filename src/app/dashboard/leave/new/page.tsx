"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Send, ArrowLeft } from "lucide-react";
import { requestLeaveAction } from "@/server/modules/leave/leave.actions";
import { toast } from "sonner";
import { LeaveType } from "@prisma/client";

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Placeholder employeeId (seharusnya diambil dari session)
    const result = await requestLeaveAction({
      ...formData,
      type: formData.type as LeaveType,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });

    if (result.success) {
      toast.success("Pengajuan cuti berhasil dikirim!");
      router.push("/dashboard/leave");
    } else {
      toast.error(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4 pl-8 pr-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4">
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Form Pengajuan Cuti</h1>
          <p className="text-gray-500">Silakan isi formulir di bawah untuk mengajukan cuti.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tipe Cuti */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-[#E02F75]" />
                Jenis Cuti
              </label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E02F75] transition-all"
              >
                <option value="ANNUAL">Cuti Tahunan</option>
                <option value="SICK">Sakit</option>
                <option value="EMERGENCY">Keperluan Mendesak</option>
                <option value="UNPAID">Cuti Diluar Tanggungan</option>
              </select>
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar size={16} className="text-[#E02F75]" />
                  Mulai
                </label>
                <input 
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E02F75]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar size={16} className="text-[#E02F75]" />
                  Selesai
                </label>
                <input 
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E02F75]"
                />
              </div>
            </div>

            {/* Alasan */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-[#E02F75]" />
                Alasan Cuti
              </label>
              <textarea 
                required
                rows={4}
                placeholder="Jelaskan alasan pengajuan cuti Anda..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E02F75]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : (
                <>
                  <Send size={18} />
                  Kirim Pengajuan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
