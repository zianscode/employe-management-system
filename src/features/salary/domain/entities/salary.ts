export interface SalaryRecord {
  nip: string;
  name: string;
  position: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: string;
}

export type SalaryStatus = "Dibayar" | "Pending";
