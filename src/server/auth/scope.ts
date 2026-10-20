import { Prisma } from "@prisma/client";
import { CurrentUser } from "./guard";
import { ROLES, isAdminRole } from "@/shared/constants/roles";

const NOTHING: Prisma.EmployeeWhereInput = { id: "__none__" };

export function employeeScopeFor(user: CurrentUser): Prisma.EmployeeWhereInput {
  if (isAdminRole(user.role)) return {};
  if (!user.employeeId) return NOTHING;
  if (user.role === ROLES.MANAGER) return { OR: [{ id: user.employeeId }, { managerId: user.employeeId }] };
  return { id: user.employeeId };
}
