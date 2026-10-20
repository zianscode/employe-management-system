-- CreateEnum
CREATE TYPE "PtkpStatus" AS ENUM ('TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3');

-- CreateEnum
CREATE TYPE "PayrollComponentType" AS ENUM ('ALLOWANCE', 'DEDUCTION');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "bpjsKesehatan" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bpjsKetenagakerjaan" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ptkpStatus" "PtkpStatus" NOT NULL DEFAULT 'TK0';

-- AlterTable
ALTER TABLE "Salary" ADD COLUMN     "bpjsKesEmployee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bpjsKesEmployer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "components" JSONB,
ADD COLUMN     "jhtEmployee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jhtEmployer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jkkEmployer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jkmEmployer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jpEmployee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jpEmployer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pph21" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pph21Method" TEXT,
ADD COLUMN     "ptkpStatus" "PtkpStatus",
ADD COLUMN     "taxableIncome" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CompanySetting" ADD COLUMN     "bpjsKesehatanWageCap" INTEGER NOT NULL DEFAULT 12000000,
ADD COLUMN     "bpjsMinimumWage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jkkRateBps" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "jpWageCap" INTEGER NOT NULL DEFAULT 11086300;

-- CreateTable
CREATE TABLE "PayrollComponent" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayrollComponentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PayrollComponent" ADD CONSTRAINT "PayrollComponent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

