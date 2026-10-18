import { prisma } from "@/server/db/prisma";
import { EmployeeStatus } from "@prisma/client";
import { NextResponse } from "next/server";

// GET ALL EMPLOYEES
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true, position: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET Employees Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// CREATE EMPLOYEE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        email: body.email,
        positionId: body.positionId || body.position, // Fallback to handle both old/new keys
        departmentId: body.departmentId || body.division, // Fallback to handle both old/new keys
        status: body.status as EmployeeStatus,
        joinDate: new Date(body.joinDate),
        avatar: body.avatar,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST Employee Error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 400 });
  }
}
