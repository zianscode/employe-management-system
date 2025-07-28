"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  MoreHorizontal,
  Mail,
  Briefcase,
  Building,
  Calendar,
} from "lucide-react";

export default function EmployeListCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cuti":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Non-Aktif":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      "from-pink-500 to-purple-600",
      "from-purple-500 to-indigo-600",
      "from-indigo-500 to-blue-600",
      "from-blue-500 to-cyan-600",
      "from-cyan-500 to-teal-600",
    ];
    return gradients[index % gradients.length];
  };

  const employees = [
    {
      id: "EMP001",
      name: "John Doe",
      email: "john.doe@company.com",
      position: "Software Engineer",
      division: "IT",
      status: "Aktif",
      joinDate: "15/1/2023",
      avatar: "JD",
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      position: "HR Manager",
      division: "HR",
      status: "Aktif",
      joinDate: "20/3/2022",
      avatar: "JS",
    },
    {
      id: "EMP003",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      position: "Financial Analyst",
      division: "Finance",
      status: "Cuti",
      joinDate: "10/6/2023",
      avatar: "MJ",
    },
    {
      id: "EMP004",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      position: "Marketing Specialist",
      division: "Marketing",
      status: "Aktif",
      joinDate: "28/2/2023",
      avatar: "SW",
    },
    {
      id: "EMP005",
      name: "David Brown",
      email: "david.brown@company.com",
      position: "Operations Manager",
      division: "Operations",
      status: "Non-Aktif",
      joinDate: "5/11/2021",
      avatar: "DB",
    },
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;
    const matchesDivision =
      divisionFilter === "all" || employee.division === divisionFilter;

    return matchesSearch && matchesStatus && matchesDivision;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Daftar Karyawan
            </h2>
            <p className="text-gray-500">
              Total {filteredEmployees.length} karyawan ditemukan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIP, atau email..."
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
            >
              <option value="all">Semua Divisi</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                NIP
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jabatan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Divisi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tanggal Bergabung
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.map((employee, index) => (
              <tr
                key={employee.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {employee.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
                        index
                      )} flex items-center justify-center text-white font-semibold text-sm mr-3`}
                    >
                      {employee.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {employee.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {employee.division}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {employee.joinDate}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className="p-6 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(
                    index
                  )} flex items-center justify-center text-white font-semibold mr-3`}
                >
                  {employee.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-500">{employee.id}</p>
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                  employee.status
                )}`}
              >
                {employee.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                {employee.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase size={16} className="mr-2" />
                {employee.position}
              </div>
              <div className="flex items-center text-gray-600">
                <Building size={16} className="mr-2" />
                {employee.division}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                Bergabung: {employee.joinDate}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada karyawan ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah kata kunci pencarian atau filter yang digunakan.
          </p>
        </div>
      )}
    </div>
  );
}
