import { Employee } from "@/shared/types/employee.types";
import { Building2, Hourglass, UserCheck, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components/StatCard";

interface EmployeesStatsProps {
  employees: Employee[];
}

const EmployeesStats: React.FC<EmployeesStatsProps> = ({ employees }) => {
  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;
  const probationCount = employees.filter((e) => e.status === "PROBATION").length;
  const divisionCount = new Set(employees.map((e) => e.division)).size;

  return (
    <StatGrid>
      <StatCard label="Total karyawan" value={employees.length} icon={Users} />
      <StatCard label="Aktif" value={activeCount} icon={UserCheck} tone="success" />
      <StatCard label="Masa percobaan" value={probationCount} icon={Hourglass} tone="warning" />
      <StatCard label="Divisi" value={divisionCount} icon={Building2} tone="info" />
    </StatGrid>
  );
};

export default EmployeesStats;
