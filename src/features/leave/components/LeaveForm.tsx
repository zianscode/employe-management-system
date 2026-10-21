"use client";

import React, { useState, useEffect } from "react";
import { Calendar, FileText, User, Loader2, Send } from "lucide-react";
import { LeaveType } from "@prisma/client";
import { getEmployeesForLeaveAction } from "@/server/modules/leave/leave.actions";
import { useSession } from "next-auth/react";
import { LeaveRequestInput } from "@/shared/types/leave.types";
import { isAdminRole } from "@/shared/constants/roles";

interface LeaveFormProps {
  onSubmit: (data: LeaveRequestInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const { data: session } = useSession();
  
  const isAdminOrHR = isAdminRole(session?.user?.role);
  const currentUserEmployeeId = session?.user?.employeeId;

  const [employees, setEmployees] = useState<{ id: string; name: string; nip: string }[]>([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "ANNUAL" as LeaveType,
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    async function fetchEmployees() {
      if (!isAdminOrHR && currentUserEmployeeId) {
        setFormData(prev => ({ ...prev, employeeId: currentUserEmployeeId }));
        return;
      }

      if (isAdminOrHR) {
        const res = await getEmployeesForLeaveAction();
        const mappedData = res.success && res.data ? res.data : [];
        setEmployees(mappedData);
        if (mappedData.length > 0) {
          setFormData(prev => ({ ...prev, employeeId: mappedData[0].id }));
        }
      }
    }
    fetchEmployees();
  }, [isAdminOrHR, currentUserEmployeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAdminOrHR ? (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Karyawan</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
            <select
              name="employeeId"
              required
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium cursor-pointer"
            >
              <option value="" disabled>Pilih Karyawan</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.nip})</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <User className="text-brand" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengajukan Sebagai</p>
                <p className="text-sm font-bold text-gray-800">{session?.user?.name || "Diri Sendiri"}</p>
              </div>
           </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">Jenis Cuti</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium cursor-pointer"
          >
            <option value="ANNUAL">Cuti Tahunan</option>
            <option value="SICK">Sakit</option>
            <option value="EMERGENCY">Izin Penting</option>
            <option value="UNPAID">Cuti Diluar Tanggungan</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Tanggal Mulai</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Tanggal Selesai</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
            <input
              type="date"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">Alasan</label>
        <textarea
          name="reason"
          required
          value={formData.reason}
          onChange={handleChange}
          rows={3}
          placeholder="Tuliskan alasan pengajuan cuti..."
          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand/50 outline-none transition-all font-medium resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 bg-gradient-to-r from-accent to-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Mengirim...
            </>
          ) : (
            <>
              <Send size={18} />
              Ajukan Sekarang
            </>
          )}
        </button>
      </div>
    </form>
  );
};
