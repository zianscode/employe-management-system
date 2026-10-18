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

  // 1. Permissions Dasar
  const permissions = [
    "view:dashboard",
    "manage:users",
    "manage:roles",
    "manage:employees",
    "manage:salary",
    "manage:attendance",
    "approve:leave",
    "system:settings",
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Roles Utama
  
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      permissions: { connect: permissions.map((name) => ({ name })) },
    },
  });

  await prisma.role.upsert({
    where: { name: "HR" },
    update: {},
    create: {
      name: "HR",
      permissions: {
        connect: [
          { name: "view:dashboard" },
          { name: "manage:employees" },
          { name: "manage:attendance" },
          { name: "manage:salary" },
          { name: "approve:leave" },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: {},
    create: {
      name: "MANAGER",
      permissions: {
        connect: [
          { name: "view:dashboard" },
          { name: "manage:attendance" },
          { name: "approve:leave" },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: {},
    create: {
      name: "EMPLOYEE",
      permissions: {
        connect: [{ name: "view:dashboard" }],
      },
    },
  });

  // 3. Default Dept & Pos for Admin
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

  // Tambahan Departemen
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

  // Tambahan Posisi
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

  // 4. SATU-SATUNYA Akun Default (Super Admin) - CLEAN START
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminEmail = "budisantoso@gmail.com";

  console.log(`Cleaning up existing data for ${adminEmail}...`);
  await prisma.employee.deleteMany({ where: { email: adminEmail } });
  await prisma.user.deleteMany({ where: { email: adminEmail } });
  
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  const adminProfileData = {
    name: "Budi Santoso",
    nip: "199505052024011001",
    avatar: "/seed/admin.jpg",
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
    isProfileComplete: true,
    onboardedAt: new Date(),
  } as const;

  await prisma.employee.create({
    data: { 
      ...adminProfileData,
      email: adminEmail,
      userId: adminUser.id,
      departmentId: adminDept.id,
      positionId: adminPos.id,
    }
  });

  console.log(`✅ Clean start successful: ${adminEmail} is recreated and fully populated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
