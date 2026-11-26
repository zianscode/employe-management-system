-- PostgreSQL schema after all six Prisma migrations.
-- +goose Up
CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'LATE',
    'EARLY_LEAVE',
    'ABSENT',
    'PERMISSION',
    'SICK'
);

CREATE TYPE public."CorrectionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'PROBATION',
    'RESIGNED',
    'TERMINATED'
);

CREATE TYPE public."EmploymentType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'REMOTE',
    'FREELANCE'
);

CREATE TYPE public."LeaveStatus" AS ENUM (
    'PENDING',
    'MANAGER_APPROVED',
    'HR_APPROVED',
    'REJECTED',
    'CANCELLED'
);

CREATE TYPE public."LeaveType" AS ENUM (
    'ANNUAL',
    'SICK',
    'EMERGENCY',
    'UNPAID'
);

CREATE TYPE public."PayrollComponentType" AS ENUM (
    'ALLOWANCE',
    'DEDUCTION'
);

CREATE TYPE public."PtkpStatus" AS ENUM (
    'TK0',
    'TK1',
    'TK2',
    'TK3',
    'K0',
    'K1',
    'K2',
    'K3'
);

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    date date NOT NULL,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    "lateInMinutes" integer DEFAULT 0 NOT NULL,
    "workHours" double precision DEFAULT 0 NOT NULL,
    "isOvertime" boolean DEFAULT false NOT NULL,
    "overtimeHours" double precision DEFAULT 0 NOT NULL,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    location text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE TABLE public."AttendanceCorrection" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    date date NOT NULL,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    reason text NOT NULL,
    status public."CorrectionStatus" DEFAULT 'PENDING'::public."CorrectionStatus" NOT NULL,
    "reviewedById" text,
    "reviewedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorUserId" text,
    "actorName" text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "targetName" text,
    detail text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."CompanySetting" (
    id text DEFAULT 'default'::text NOT NULL,
    "companyName" text DEFAULT 'Perusahaan Saya'::text NOT NULL,
    "companyCode" text,
    npwp text,
    phone text,
    "workStartTime" text DEFAULT '08:00'::text NOT NULL,
    "workEndTime" text DEFAULT '17:00'::text NOT NULL,
    "lateToleranceMinutes" integer DEFAULT 15 NOT NULL,
    "overtimeRatePerHour" integer DEFAULT 50000 NOT NULL,
    "workingDaysPerMonth" integer DEFAULT 22 NOT NULL,
    "annualLeaveQuota" integer DEFAULT 12 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bpjsKesehatanWageCap" integer DEFAULT 12000000 NOT NULL,
    "bpjsMinimumWage" integer DEFAULT 0 NOT NULL,
    "jkkRateBps" integer DEFAULT 24 NOT NULL,
    "jpWageCap" integer DEFAULT 11086300 NOT NULL
);

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."Employee" (
    id text NOT NULL,
    "userId" text,
    name text NOT NULL,
    email text NOT NULL,
    nip text,
    "joinDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    status public."EmployeeStatus" DEFAULT 'PROBATION'::public."EmployeeStatus" NOT NULL,
    "employmentType" public."EmploymentType" DEFAULT 'FULL_TIME'::public."EmploymentType" NOT NULL,
    "salaryBase" integer DEFAULT 0 NOT NULL,
    "leaveQuota" integer DEFAULT 12 NOT NULL,
    "departmentId" text,
    "positionId" text,
    "managerId" text,
    avatar text,
    phone text,
    address text,
    gender text,
    "birthDate" timestamp(3) without time zone,
    "placeOfBirth" text,
    "identityNumber" text,
    bio text,
    "bankName" text,
    "bankAccount" text,
    "bankHolderName" text,
    "npwpNumber" text,
    "emergencyName" text,
    "emergencyPhone" text,
    "emergencyRelation" text,
    education text,
    skills text,
    "isProfileComplete" boolean DEFAULT false NOT NULL,
    "onboardedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bpjsKesehatan" boolean DEFAULT true NOT NULL,
    "bpjsKetenagakerjaan" boolean DEFAULT true NOT NULL,
    "ptkpStatus" public."PtkpStatus" DEFAULT 'TK0'::public."PtkpStatus" NOT NULL
);

CREATE TABLE public."Holiday" (
    id text NOT NULL,
    date date NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."LeaveRequest" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    type public."LeaveType" DEFAULT 'ANNUAL'::public."LeaveType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    duration integer NOT NULL,
    reason text NOT NULL,
    "rejectionReason" text,
    status public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "managerApproverId" text,
    "managerApprovedAt" timestamp(3) without time zone,
    "hrApproverId" text,
    "hrApprovedAt" timestamp(3) without time zone,
    "rejectedById" text,
    "rejectedAt" timestamp(3) without time zone
);

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."PayrollComponent" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    name text NOT NULL,
    type public."PayrollComponentType" NOT NULL,
    amount integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE TABLE public."Position" (
    id text NOT NULL,
    name text NOT NULL,
    "salaryBase" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public."Salary" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "periodMonth" integer NOT NULL,
    "periodYear" integer NOT NULL,
    "basicSalary" integer NOT NULL,
    allowances integer DEFAULT 0 NOT NULL,
    deductions integer DEFAULT 0 NOT NULL,
    "overtimePay" integer DEFAULT 0 NOT NULL,
    "unpaidLeaveCut" integer DEFAULT 0 NOT NULL,
    "totalGross" integer NOT NULL,
    "totalNet" integer NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bpjsKesEmployee" integer DEFAULT 0 NOT NULL,
    "bpjsKesEmployer" integer DEFAULT 0 NOT NULL,
    components jsonb,
    "jhtEmployee" integer DEFAULT 0 NOT NULL,
    "jhtEmployer" integer DEFAULT 0 NOT NULL,
    "jkkEmployer" integer DEFAULT 0 NOT NULL,
    "jkmEmployer" integer DEFAULT 0 NOT NULL,
    "jpEmployee" integer DEFAULT 0 NOT NULL,
    "jpEmployer" integer DEFAULT 0 NOT NULL,
    pph21 integer DEFAULT 0 NOT NULL,
    "pph21Method" text,
    "ptkpStatus" public."PtkpStatus",
    "taxableIncome" integer DEFAULT 0 NOT NULL
);

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "mustChangePassword" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."CompanySetting"
    ADD CONSTRAINT "CompanySetting_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Holiday"
    ADD CONSTRAINT "Holiday_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."LeaveRequest"
    ADD CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PayrollComponent"
    ADD CONSTRAINT "PayrollComponent_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Position"
    ADD CONSTRAINT "Position_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Salary"
    ADD CONSTRAINT "Salary_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);

CREATE INDEX "AttendanceCorrection_employeeId_date_idx" ON public."AttendanceCorrection" USING btree ("employeeId", date);

CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON public."Attendance" USING btree ("employeeId", date);

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");

CREATE UNIQUE INDEX "Department_name_key" ON public."Department" USING btree (name);

CREATE UNIQUE INDEX "Employee_email_key" ON public."Employee" USING btree (email);

CREATE UNIQUE INDEX "Employee_nip_key" ON public."Employee" USING btree (nip);

CREATE UNIQUE INDEX "Employee_userId_key" ON public."Employee" USING btree ("userId");

CREATE UNIQUE INDEX "Holiday_date_key" ON public."Holiday" USING btree (date);

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);

CREATE UNIQUE INDEX "Position_name_key" ON public."Position" USING btree (name);

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);

CREATE UNIQUE INDEX "Salary_employeeId_periodMonth_periodYear_key" ON public."Salary" USING btree ("employeeId", "periodMonth", "periodYear");

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES public."Position"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."LeaveRequest"
    ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."LeaveRequest"
    ADD CONSTRAINT "LeaveRequest_hrApproverId_fkey" FOREIGN KEY ("hrApproverId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."LeaveRequest"
    ADD CONSTRAINT "LeaveRequest_managerApproverId_fkey" FOREIGN KEY ("managerApproverId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."LeaveRequest"
    ADD CONSTRAINT "LeaveRequest_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."PayrollComponent"
    ADD CONSTRAINT "PayrollComponent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."Salary"
    ADD CONSTRAINT "Salary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- +goose Down
-- +goose StatementBegin
DO $$ BEGIN RAISE EXCEPTION 'EMS baseline is forward-only'; END $$;
-- +goose StatementEnd
