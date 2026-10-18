import { prisma } from "@/server/db/prisma";
import { EmployeeStatus } from "@prisma/client";

const ACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION];

class ReportService {
  async getSalaryTrend(employeeId?: string) {
    const groups = await prisma.salary.groupBy({
      by: ["periodYear", "periodMonth"],
      where: employeeId ? { employeeId } : {},
      _sum: { totalNet: true },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      take: 6,
    });

    return groups.reverse().map((g) => ({
      month: `${g.periodMonth}/${g.periodYear}`,
      total: g._sum.totalNet || 0,
    }));
  }

  async getDepartmentDistribution() {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { employees: { where: { status: { in: ACTIVE_STATUSES } } } } } },
    });

    return departments
      .filter((d) => d._count.employees > 0)
      .map((d) => ({ name: d.name, count: d._count.employees }));
  }
}

export const reportService = new ReportService();
