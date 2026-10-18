-- =====================================================================
-- Merampingkan schema & memperbaiki alur kerja
-- - Hapus tabel NextAuth adapter (Account, Session, VerificationToken) & Permission
-- - Nominal uang: Float -> Integer (rupiah)
-- - Status karyawan LEAVE dihapus (cuti dibaca dari LeaveRequest)
-- - Approval cuti dua tahap (manager & HR) + penolakan, mengarah ke Employee
-- - Riwayat absensi/cuti/gaji tidak ikut terhapus saat karyawan dihapus
-- - Tabel CompanySetting
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EmployeeStatus: pindahkan data LEAVE -> ACTIVE sebelum enum diubah
-- ---------------------------------------------------------------------
UPDATE "Employee" SET "status" = 'ACTIVE' WHERE "status" = 'LEAVE';

BEGIN;
CREATE TYPE "EmployeeStatus_new" AS ENUM ('ACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED');
ALTER TABLE "Employee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "status" TYPE "EmployeeStatus_new" USING ("status"::text::"EmployeeStatus_new");
ALTER TYPE "EmployeeStatus" RENAME TO "EmployeeStatus_old";
ALTER TYPE "EmployeeStatus_new" RENAME TO "EmployeeStatus";
DROP TYPE "EmployeeStatus_old";
ALTER TABLE "Employee" ALTER COLUMN "status" SET DEFAULT 'PROBATION';
COMMIT;

-- ---------------------------------------------------------------------
-- 2. Hapus foreign key lama
-- ---------------------------------------------------------------------
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_employeeId_fkey";
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_employeeId_fkey";
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_approvedById_fkey";
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_employeeId_fkey";
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- ---------------------------------------------------------------------
-- 3. Nominal uang: Float -> Integer (dibulatkan)
-- ---------------------------------------------------------------------
ALTER TABLE "Position"
  ALTER COLUMN "salaryBase" SET DATA TYPE INTEGER USING ROUND("salaryBase")::INTEGER,
  ALTER COLUMN "salaryBase" SET DEFAULT 0;

UPDATE "Employee" SET "salaryBase" = 0 WHERE "salaryBase" IS NULL;
ALTER TABLE "Employee"
  ALTER COLUMN "salaryBase" SET DATA TYPE INTEGER USING ROUND("salaryBase")::INTEGER,
  ALTER COLUMN "salaryBase" SET DEFAULT 0,
  ALTER COLUMN "salaryBase" SET NOT NULL;

ALTER TABLE "Salary"
  ALTER COLUMN "basicSalary"    SET DATA TYPE INTEGER USING ROUND("basicSalary")::INTEGER,
  ALTER COLUMN "allowances"     SET DATA TYPE INTEGER USING ROUND("allowances")::INTEGER,
  ALTER COLUMN "allowances"     SET DEFAULT 0,
  ALTER COLUMN "deductions"     SET DATA TYPE INTEGER USING ROUND("deductions")::INTEGER,
  ALTER COLUMN "deductions"     SET DEFAULT 0,
  ALTER COLUMN "overtimePay"    SET DATA TYPE INTEGER USING ROUND("overtimePay")::INTEGER,
  ALTER COLUMN "overtimePay"    SET DEFAULT 0,
  ALTER COLUMN "unpaidLeaveCut" SET DATA TYPE INTEGER USING ROUND("unpaidLeaveCut")::INTEGER,
  ALTER COLUMN "unpaidLeaveCut" SET DEFAULT 0,
  ALTER COLUMN "totalGross"     SET DATA TYPE INTEGER USING ROUND("totalGross")::INTEGER,
  ALTER COLUMN "totalNet"       SET DATA TYPE INTEGER USING ROUND("totalNet")::INTEGER;

-- ---------------------------------------------------------------------
-- 4. LeaveRequest: kolom approval baru, pindahkan data approvedById lama
--    (approvedById dulu berisi User.id -> sekarang Employee.id)
-- ---------------------------------------------------------------------
ALTER TABLE "LeaveRequest"
  ADD COLUMN "managerApproverId" TEXT,
  ADD COLUMN "managerApprovedAt" TIMESTAMP(3),
  ADD COLUMN "hrApproverId" TEXT,
  ADD COLUMN "hrApprovedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedById" TEXT,
  ADD COLUMN "rejectedAt" TIMESTAMP(3);

UPDATE "LeaveRequest" lr
SET "hrApproverId" = e."id", "hrApprovedAt" = lr."updatedAt"
FROM "Employee" e
WHERE e."userId" = lr."approvedById" AND lr."status" = 'HR_APPROVED';

UPDATE "LeaveRequest" lr
SET "managerApproverId" = e."id", "managerApprovedAt" = lr."updatedAt"
FROM "Employee" e
WHERE e."userId" = lr."approvedById" AND lr."status" = 'MANAGER_APPROVED';

UPDATE "LeaveRequest" lr
SET "rejectedById" = e."id", "rejectedAt" = lr."updatedAt"
FROM "Employee" e
WHERE e."userId" = lr."approvedById" AND lr."status" = 'REJECTED';

ALTER TABLE "LeaveRequest" DROP COLUMN "approvedById";

-- ---------------------------------------------------------------------
-- 5. Hapus tabel yang tidak dipakai
-- ---------------------------------------------------------------------
DROP TABLE "Account";
DROP TABLE "Session";
DROP TABLE "VerificationToken";
DROP TABLE "_PermissionToRole";
DROP TABLE "Permission";

-- ---------------------------------------------------------------------
-- 6. Pengaturan perusahaan
-- ---------------------------------------------------------------------
CREATE TABLE "CompanySetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT 'Perusahaan Saya',
    "companyCode" TEXT,
    "npwp" TEXT,
    "phone" TEXT,
    "workStartTime" TEXT NOT NULL DEFAULT '08:00',
    "workEndTime" TEXT NOT NULL DEFAULT '17:00',
    "lateToleranceMinutes" INTEGER NOT NULL DEFAULT 15,
    "overtimeRatePerHour" INTEGER NOT NULL DEFAULT 50000,
    "workingDaysPerMonth" INTEGER NOT NULL DEFAULT 22,
    "annualLeaveQuota" INTEGER NOT NULL DEFAULT 12,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySetting_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------
-- 7. Foreign key baru: riwayat TIDAK ikut terhapus (RESTRICT)
-- ---------------------------------------------------------------------
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_managerApproverId_fkey" FOREIGN KEY ("managerApproverId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_hrApproverId_fkey" FOREIGN KEY ("hrApproverId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
