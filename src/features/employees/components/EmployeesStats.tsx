import { Employee } from "@/shared/types/employee.types";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";

interface EmployeesStatsProps {
  employees: Employee[];
}

const EmployeesStats: React.FC<EmployeesStatsProps> = ({ employees }) => {
  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;
  const probationCount = employees.filter((e) => e.status === "PROBATION").length;
  const divisionCount = new Set(employees.map((e) => e.division)).size;

  return (
    <StatGrid>
      <StatCard label="Total karyawan" value={employees.length} />
      <StatCard label="Aktif" value={activeCount} />
      <StatCard label="Masa percobaan" value={probationCount} />
      <StatCard label="Divisi" value={divisionCount} />
    </StatGrid>
  );
};

export default EmployeesStats;
