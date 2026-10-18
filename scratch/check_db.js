import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@ems.com' },
    include: { employee: true }
  });
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
}

check();
