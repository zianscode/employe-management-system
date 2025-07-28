export default function StatsCards() {

   

  const stats = [
    { label: "Hadir", value: 2, color: "from-green-400 to-green-600" },
    { label: "Terlambat", value: 1, color: "from-yellow-400 to-yellow-600" },
    { label: "Izin", value: 1, color: "from-blue-400 to-blue-600" },
    { label: "Sakit", value: 0, color: "from-orange-400 to-orange-600" },
    { label: "Alpha", value: 1, color: "from-red-400 to-red-600" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
