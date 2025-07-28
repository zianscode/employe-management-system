"use client"

import React, { useState } from 'react';
import { Search, Download, Eye, Filter, Calendar,DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function SalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState('January 2024');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  const salaryData = [
    {
      nip: 'EMP001',
      name: 'John Doe',
      position: 'Software Engineer',
      basicSalary: 8000000,
      allowance: 1500000,
      deduction: 800000,
      totalSalary: 8700000,
      status: 'Dibayar'
    },
    {
      nip: 'EMP002',
      name: 'Jane Smith',
      position: 'HR Manager',
      basicSalary: 12000000,
      allowance: 2000000,
      deduction: 1200000,
      totalSalary: 12800000,
      status: 'Dibayar'
    },
    {
      nip: 'EMP003',
      name: 'Mike Johnson',
      position: 'Financial Analyst',
      basicSalary: 7000000,
      allowance: 1200000,
      deduction: 700000,
      totalSalary: 7500000,
      status: 'Pending'
    },
    {
      nip: 'EMP004',
      name: 'Sarah Wilson',
      position: 'Marketing Specialist',
      basicSalary: 6500000,
      allowance: 1000000,
      deduction: 650000,
      totalSalary: 6850000,
      status: 'Dibayar'
    },
    {
      nip: 'EMP005',
      name: 'David Brown',
      position: 'Operations Manager',
      basicSalary: 10000000,
      allowance: 1800000,
      deduction: 1000000,
      totalSalary: 10800000,
      status: 'Pending'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalStats = {
    totalSalary: salaryData.reduce((sum, emp) => sum + emp.totalSalary, 0),
    basicSalary: salaryData.reduce((sum, emp) => sum + emp.basicSalary, 0),
    totalAllowance: salaryData.reduce((sum, emp) => sum + emp.allowance, 0),
    totalDeduction: salaryData.reduce((sum, emp) => sum + emp.deduction, 0)
  };

  const filteredData = salaryData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.nip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5A57] via-[#E02F75] to-[#6700A3] p-8 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Manajemen Gaji</h1>
              <p className="text-white/80 text-lg">Kelola dan pantau penggajian karyawan</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border border-white/20">
              <Download size={20} />
              Export Payroll
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 mb-5">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Gaji</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalSalary)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#FF5A57] to-[#E02F75] p-3 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Gaji Pokok</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.basicSalary)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#E02F75] to-[#6700A3] p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Tunjangan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalAllowance)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#6700A3] to-[#050C38] p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Potongan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalDeduction)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#050C38] to-[#FF5A57] p-3 rounded-xl">
                <TrendingDown className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Data Penggajian</h2>
                <p className="text-gray-600">Data gaji karyawan untuk periode {selectedMonth}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau NIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 w-full sm:w-64"
                  />
                </div>

                {/* Month Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white appearance-none cursor-pointer"
                  >
                    <option>January 2024</option>
                    <option>February 2024</option>
                    <option>March 2024</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E02F75]/20 focus:border-[#E02F75] transition-all duration-300 bg-white appearance-none cursor-pointer"
                  >
                    <option>Semua Status</option>
                    <option>Dibayar</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">NIP</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jabatan</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Gaji Pokok</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Tunjangan</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Potongan</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Gaji</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((employee) => (
                  <tr key={employee.nip} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.nip}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{employee.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(employee.basicSalary)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(employee.allowance)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(employee.deduction)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{formatCurrency(employee.totalSalary)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'Dibayar' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[#6700A3] hover:text-[#E02F75] transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Menampilkan {filteredData.length} dari {salaryData.length} data</span>
              <div className="flex items-center gap-2">
                <span>Total karyawan:</span>
                <span className="bg-gradient-to-r from-[#E02F75] to-[#6700A3] bg-clip-text text-transparent font-bold">
                  {salaryData.length} orang
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}