"use client";

import React, { useState } from "react";
import { Calendar, Filter as FilterIcon } from "lucide-react"; 

export default function ReportFilter() {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-06-30");
  const [division, setDivision] = useState("Semua Divisi");
  const [reportType, setReportType] = useState("Ringkasan");

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon className="w-5 h-5 text-gray-600" /> 
        <h2 className="text-lg font-semibold text-gray-800">Filter Laporan</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Sesuaikan periode dan parameter laporan
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Mulai
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Selesai
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Divisi
          </label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
          >
            <option>Semua Divisi</option>
            <option>IT</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Marketing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipe Laporan
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
          >
            <option>Ringkasan</option>
            <option>Detail</option>
            <option>Komparasi</option>
          </select>
        </div>
      </div>
    </div>
  );
}