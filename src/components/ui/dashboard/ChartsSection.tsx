import { TrendingUp, Building } from "lucide-react";

export default function ChartsSection() {
  const divisionData = [
    { name: "Operations", value: 55, color: "#FF5A57", percentage: 22.2 },
    { name: "Sales", value: 48, color: "#E02F75", percentage: 19.4 },
    { name: "IT", value: 45, color: "#6700A3", percentage: 18.1 },
    { name: "Marketing", value: 40, color: "#050C38", percentage: 16.1 },
    { name: "Finance", value: 35, color: "#8B5CF6", percentage: 14.1 },
    { name: "HR", value: 25, color: "#06B6D4", percentage: 10.1 },
  ];

  const attendanceData = [
    { month: "Jan", hadir: 95, izin: 8, sakit: 3 },
    { month: "Feb", hadir: 88, izin: 12, sakit: 5 },
    { month: "Mar", hadir: 98, izin: 6, sakit: 2 },
    { month: "Apr", hadir: 92, izin: 10, sakit: 4 },
    { month: "May", hadir: 96, izin: 7, sakit: 3 },
    { month: "Jun", hadir: 94, izin: 9, sakit: 2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Donut Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#E02F75] to-[#6700A3] text-white mr-3">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Distribusi Karyawan per Divisi
            </h3>
            <p className="text-gray-600">Jumlah karyawan di setiap divisi</p>
          </div>
        </div>

        {/* Custom Donut Chart */}
        <div className="relative w-80 h-80 mx-auto">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transform -rotate-90"
          >
            {(() => {
              const total = divisionData.reduce(
                (sum, item) => sum + item.value,
                0
              );
              let cumulativePercentage = 0;

              return divisionData.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage * 2.51} 251.2`;
                const strokeDashoffset = -cumulativePercentage * 2.51;
                cumulativePercentage += percentage;

                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:stroke-width-24"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {divisionData.reduce((sum, item) => sum + item.value, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Karyawan</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {divisionData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">
                  {item.value}
                </div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#6700A3] to-[#050C38] text-white mr-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Tren Kehadiran 6 Bulan Terakhir
            </h3>
            <p className="text-gray-600">
              Persentase kehadiran, izin, dan sakit
            </p>
          </div>
        </div>

        {/* Custom Bar Chart */}
        <div className="h-80 flex items-end justify-between px-4 py-8">
          {attendanceData.map((item, index) => {
            const maxValue = Math.max(
              ...attendanceData.map((data) =>
                Math.max(data.hadir, data.izin, data.sakit)
              )
            );

            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="flex items-end space-x-1 h-60">
                  {/* Hadir Bar */}
                  <div className="relative group">
                    <div
                      className="w-6 bg-[#FF5A57] rounded-t transition-all duration-300 hover:bg-[#E02F75]"
                      style={{ height: `${(item.hadir / maxValue) * 240}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hadir}%
                    </div>
                  </div>

                  {/* Izin Bar */}
                  <div className="relative group">
                    <div
                      className="w-6 bg-[#E02F75] rounded-t transition-all duration-300 hover:bg-[#6700A3]"
                      style={{ height: `${(item.izin / maxValue) * 240}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.izin}%
                    </div>
                  </div>

                  {/* Sakit Bar */}
                  <div className="relative group">
                    <div
                      className="w-6 bg-[#6700A3] rounded-t transition-all duration-300 hover:bg-[#050C38]"
                      style={{ height: `${(item.sakit / maxValue) * 240}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.sakit}%
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FF5A57] rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Hadir</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#E02F75] rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Izin</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#6700A3] rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Sakit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
