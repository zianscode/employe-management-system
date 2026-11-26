export type SalaryStatus = "Dibayar" | "Pending";

export interface SalaryRecord {
  id: string;
  nip: string;
  name: string;
  position: string;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  bpjsEmployee: number;
  pph21: number;
  deduction: number;
  totalSalary: number;
  status: SalaryStatus;
  period: string;
}

export interface SlipLine {
  label: string;
  amount: number;
}

export interface SalarySlip {
  id: string;
  companyName: string;
  companyNpwp: string | null;
  periodLabel: string;
  employee: {
    name: string;
    nip: string;
    position: string;
    department: string;
    ptkp: string;
    npwp: string | null;
  };
  earnings: SlipLine[];
  deductions: SlipLine[];
  employerContributions: SlipLine[];
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  taxableIncome: number;
  pph21Method: string | null;
  status: SalaryStatus;
  paidAt: string | null;
}

export interface PayrollComponentRow {
  id: string;
  name: string;
  type: "ALLOWANCE" | "DEDUCTION";
  amount: number;
}
