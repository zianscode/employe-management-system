import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [superAdminRole] = await Promise.all(
    ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE"].map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  await prisma.companySetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", companyName: "PT. Teknologi Maju Bersama", companyCode: "TMB" },
  });

  const adminDept = await prisma.department.upsert({
    where: { name: "Direksi" },
    update: {},
    create: { name: "Direksi", description: "Executive Board and Strategic Management" },
  });

  const adminPos = await prisma.position.upsert({
    where: { name: "Chief Executive Officer" },
    update: {},
    create: { name: "Chief Executive Officer", salaryBase: 25000000 },
  });

  await prisma.department.upsert({
    where: { name: "Teknologi Informasi" },
    update: {},
    create: { name: "Teknologi Informasi", description: "Software Development and IT Operations" },
  });

  await prisma.department.upsert({
    where: { name: "Sumber Daya Manusia" },
    update: {},
    create: { name: "Sumber Daya Manusia", description: "People Operations and Recruitment" },
  });

  await prisma.position.upsert({
    where: { name: "Lead Developer" },
    update: {},
    create: { name: "Lead Developer", salaryBase: 18000000 },
  });

  await prisma.position.upsert({
    where: { name: "HR Manager" },
    update: {},
    create: { name: "HR Manager", salaryBase: 15000000 },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminEmail = "budisantoso@gmail.com";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roleId: superAdminRole.id },
    create: { email: adminEmail, password: hashedPassword, roleId: superAdminRole.id, mustChangePassword: true },
  });

  const adminProfileData = {
    name: "Budi Santoso",
    nip: "199505052024011001",
    avatar: "/images/seed/admin-avatar.jpg",
    gender: "MALE",
    birthDate: new Date("1995-05-05"),
    placeOfBirth: "Bandung",
    phone: "081288889999",
    address: "Jl. Teknologi No. 42, Kota Bandung, Jawa Barat",
    identityNumber: "3273010505950001",
    bankName: "BCA",
    bankAccount: "8820334455",
    bankHolderName: "Budi Santoso",
    npwpNumber: "72.445.667.1-423.000",
    emergencyName: "Siti Aminah",
    emergencyPhone: "081277776666",
    emergencyRelation: "Pasangan",
    bio: "Seorang profesional di bidang manajemen strategis dengan pengalaman lebih dari 10 tahun memimpin operasional perusahaan teknologi.",
    education: "S1 Teknik Informatika - Institut Teknologi Bandung (2013 - 2017)",
    skills: "React.js, Next.js, TypeScript, UI/UX Design, Project Management",
    joinDate: new Date("2024-01-01"),
    status: "ACTIVE",
    salaryBase: adminPos.salaryBase,
    isProfileComplete: true,
    onboardedAt: new Date(),
  } as const;

  const adminEmployee = {
    ...adminProfileData,
    userId: adminUser.id,
    departmentId: adminDept.id,
    positionId: adminPos.id,
  };

  await prisma.employee.upsert({
    where: { email: adminEmail },
    update: adminEmployee,
    create: { ...adminEmployee, email: adminEmail },
  });

  console.log(`✅ Seed selesai. Login pertama: ${adminEmail} / admin123 (wajib ganti password)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
