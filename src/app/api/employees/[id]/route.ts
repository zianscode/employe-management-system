import { prisma } from "@/server/db/prisma";
import { NextResponse } from "next/server";

// GET EMPLOYEE BY ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { department: true, position: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET Employee Error:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

// UPDATE EMPLOYEE
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        positionId: body.positionId || body.position, // Fallback keys
        departmentId: body.departmentId || body.division, // Fallback keys
        status: body.status,
        joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        avatar: body.avatar,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("PATCH Employee Error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 400 });
  }
}

// DELETE EMPLOYEE
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE Employee Error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
