import { prisma } from "@/server/db/prisma";

export class ReportService {
  async getSalaryTrend(employeeId?: string) {
    const where = employeeId ? { employeeId } : {};
    
    const salaries = await prisma.salary.findMany({
      where,
      orderBy: [{ periodYear: 'asc' }, { periodMonth: 'asc' }],
      take: 6
    });

    return salaries.map(s => ({
      month: `${s.periodMonth}/${s.periodYear}`,
      total: s.totalNet
    }));
  }

  async getDepartmentDistribution() {
    const departments = await prisma.department.findMany({
      where: {
        employees: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    return departments.map(d => ({
      name: d.name,
      count: d._count.employees
    }));
  }
}
