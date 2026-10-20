export interface DepartmentRow {
  id: string;
  name: string;
  description: string | null;
  employeeCount: number;
}

export interface PositionRow {
  id: string;
  name: string;
  salaryBase: number;
  employeeCount: number;
}
