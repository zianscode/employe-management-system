export interface SalaryRecord {
  id: string;
  nip: string;
  name: string;
  position: string;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  deduction: number;
  totalSalary: number;
  status: SalaryStatus;
  period: string;
}

export type SalaryStatus = "Dibayar" | "Pending";
