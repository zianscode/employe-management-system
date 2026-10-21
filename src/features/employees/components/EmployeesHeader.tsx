import { Download } from "lucide-react";

interface EmployeesHeaderProps {
  onAddClick?: () => void;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = () => {
  return (
    <div className="bg-gradient-to-r from-accent via-brand to-brand-dark px-8 py-6 rounded-2xl shadow-lg border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Karyawan</h1>
          <p className="text-white/80 mt-1 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Kelola data dan performa tim Anda secara efisien
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all border border-white/20 font-semibold text-sm">
            <Download size={16} />
            <span>Ekspor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeesHeader;
