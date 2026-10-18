/** Baris pada tabel penggajian (semua nominal dalam rupiah) */
export interface SalaryRecord {
  id: string;
  nip: string;
  name: string;
  position: string;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  /** Potongan lain + potongan cuti diluar tanggungan */
  deduction: number;
  totalSalary: number;
  status: SalaryStatus;
  /** "MM/YYYY" */
  period: string;
}

export type SalaryStatus = "Dibayar" | "Pending";
