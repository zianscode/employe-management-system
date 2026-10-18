"use server";

import { prisma } from "@/server/db/prisma";

export async function getOrgData() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    const positions = await prisma.position.findMany({
      orderBy: { name: 'asc' }
    });
    return { departments, positions };
  } catch (error) {
    console.error("Failed to fetch organization data:", error);
    return { departments: [], positions: [] };
  }
}
