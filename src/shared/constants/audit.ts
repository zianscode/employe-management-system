export const AUDIT_ACTIONS = {
  EMPLOYEE_CREATED: "menambah karyawan",
  EMPLOYEE_UPDATED: "mengubah data karyawan",
  EMPLOYEE_PROMOTED: "mengubah status menjadi aktif untuk",
  EMPLOYEE_DELETED: "menghapus karyawan",
  ACCOUNT_PASSWORD_RESET: "mereset password",
  ACCOUNT_UNLOCKED: "membuka kunci akun",
  LEAVE_APPROVED: "menyetujui cuti",
  LEAVE_REJECTED: "menolak cuti",
  CORRECTION_APPROVED: "menyetujui koreksi absensi",
  CORRECTION_REJECTED: "menolak koreksi absensi",
  PAYROLL_GENERATED: "menghitung gaji",
  SALARY_PAID: "menandai slip dibayar",
  PAYROLL_PERIOD_PAID: "menandai semua slip dibayar",
  PAYROLL_COMPONENT_ADDED: "menambah komponen gaji",
  PAYROLL_COMPONENT_DELETED: "menghapus komponen gaji",
  COMPANY_SETTING_UPDATED: "mengubah pengaturan perusahaan",
  HOLIDAY_ADDED: "menambah hari libur",
  HOLIDAY_DELETED: "menghapus hari libur",
  DEPARTMENT_SAVED: "menyimpan divisi",
  DEPARTMENT_DELETED: "menghapus divisi",
  POSITION_SAVED: "menyimpan jabatan",
  POSITION_DELETED: "menghapus jabatan",
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export const AUDIT_ENTITIES = {
  EMPLOYEE: "Karyawan",
  ACCOUNT: "Akun",
  LEAVE: "Cuti",
  ATTENDANCE_CORRECTION: "Absensi",
  SALARY: "Gaji",
  PAYROLL_PERIOD: "Gaji",
  PAYROLL_COMPONENT: "Gaji",
  COMPANY_SETTING: "Pengaturan",
  HOLIDAY: "Pengaturan",
  DEPARTMENT: "Organisasi",
  POSITION: "Organisasi",
} as const;

export type AuditEntity = keyof typeof AUDIT_ENTITIES;
