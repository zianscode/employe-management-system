import { Clock, Users, UserCheck, UserX, AlertCircle } from "lucide-react";

interface DataTableProps {
  searchQuery: string;
  selectedDate: string;
  statusFilter: string;
}

export default function DataTable({ 
  searchQuery, 
  selectedDate, 
  statusFilter 
}: DataTableProps) {
  const attendanceData = [
    {
      nip: "EMP001",
      nama: "John Doe",
      tanggal: "15/1/2024",
      jamMasuk: "08:00",
      jamKeluar: "17:00",
      jamKerja: "9 jam",
      status: "Hadir",
    },
    {
      nip: "EMP002",
      nama: "Jane Smith",
      tanggal: "15/1/2024",
      jamMasuk: "08:15",
      jamKeluar: "17:30",
      jamKerja: "9 jam 15 menit",
      status: "Hadir",
    },
    {
      nip: "EMP003",
      nama: "Mike Johnson",
      tanggal: "15/1/2024",
      jamMasuk: "-",
      jamKeluar: "-",
      jamKerja: "-",
      status: "Izin",
    },
    {
      nip: "EMP004",
      nama: "Sarah Wilson",
      tanggal: "15/1/2024",
      jamMasuk: "08:30",
      jamKeluar: "17:00",
      jamKerja: "8 jam 30 menit",
      status: "Terlambat",
    },
    {
      nip: "EMP005",
      nama: "David Brown",
      tanggal: "15/1/2024",
      jamMasuk: "-",
      jamKeluar: "-",
      jamKerja: "-",
      status: "Alpha",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-700 border-green-200";
      case "Izin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Terlambat":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Alpha":
        return "bg-red-100 text-red-700 border-red-200";
      case "Sakit":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <UserCheck className="w-4 h-4" />;
      case "Izin":
        return <Clock className="w-4 h-4" />;
      case "Terlambat":
        return <AlertCircle className="w-4 h-4" />;
      case "Alpha":
        return <UserX className="w-4 h-4" />;
      case "Sakit":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const filteredData = attendanceData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua Status" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Data Absensi
        </h2>
        <p className="text-gray-600">
          Data kehadiran karyawan untuk tanggal {selectedDate}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                NIP
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nama Karyawan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam Masuk
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam Keluar
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam Kerja
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((employee, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {employee.nip}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                  {employee.nama}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {employee.tanggal}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {employee.jamMasuk}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {employee.jamKeluar}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {employee.jamKerja}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {getStatusIcon(employee.status)}
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Tidak ada data yang ditemukan
          </p>
          <p className="text-gray-400">Coba ubah filter pencarian Anda</p>
        </div>
      )}
    </div>
  );
}