import { prisma } from "@/server/db/prisma";
import { CurrentUser } from "@/server/auth/guard";
import { AUDIT_ACTIONS, AUDIT_ENTITIES, AuditAction, AuditEntity } from "@/shared/constants/audit";
import { AuditLogRow } from "@/shared/types/audit.types";
import { formatDate, formatPeriod } from "@/shared/utils/date";

interface AuditEntry {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  targetName?: string | null;
  detail?: string | null;
}

const DEFAULT_LIMIT = 100;

class AuditService {
  private async resolveTargetName(entity: AuditEntity, id: string): Promise<string | null> {
    switch (entity) {
      case "EMPLOYEE":
        return (await prisma.employee.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
      case "ACCOUNT": {
        const user = await prisma.user.findUnique({ where: { id }, select: { email: true, employee: { select: { name: true } } } });
        return user ? user.employee?.name ?? user.email : null;
      }
      case "LEAVE":
        return (await prisma.leaveRequest.findUnique({ where: { id }, select: { employee: { select: { name: true } } } }))?.employee.name ?? null;
      case "ATTENDANCE_CORRECTION": {
        const correction = await prisma.attendanceCorrection.findUnique({
          where: { id },
          select: { date: true, employee: { select: { name: true } } },
        });
        return correction ? `${correction.employee.name} (${formatDate(correction.date)})` : null;
      }
      case "SALARY": {
        const salary = await prisma.salary.findUnique({
          where: { id },
          select: { periodMonth: true, periodYear: true, employee: { select: { name: true } } },
        });
        return salary ? `${salary.employee.name}, ${formatPeriod(salary.periodMonth, salary.periodYear)}` : null;
      }
      case "PAYROLL_COMPONENT": {
        const component = await prisma.payrollComponent.findUnique({
          where: { id },
          select: { name: true, employee: { select: { name: true } } },
        });
        return component ? `${component.name} (${component.employee.name})` : null;
      }
      case "HOLIDAY": {
        const holiday = await prisma.holiday.findUnique({ where: { id }, select: { name: true, date: true } });
        return holiday ? `${holiday.name} (${formatDate(holiday.date)})` : null;
      }
      case "DEPARTMENT":
        return (await prisma.department.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
      case "POSITION":
        return (await prisma.position.findUnique({ where: { id }, select: { name: true } }))?.name ?? null;
      default:
        return null;
    }
  }

  private async actorName(actor: CurrentUser) {
    if (actor.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: actor.employeeId }, select: { name: true } });
      if (employee) return employee.name;
    }
    const user = await prisma.user.findUnique({ where: { id: actor.userId }, select: { email: true } });
    return user?.email ?? "Sistem";
  }

  async track<T>(actor: CurrentUser, entry: AuditEntry, run: () => Promise<T>): Promise<T> {
    let targetName = entry.targetName ?? null;
    if (!targetName && entry.entityId) {
      targetName = await this.resolveTargetName(entry.entity, entry.entityId).catch(() => null);
    }

    const result = await run();

    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: actor.userId,
          actorName: await this.actorName(actor),
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          targetName,
          detail: entry.detail ?? null,
        },
      });
    } catch (error) {
      console.error("[AUDIT] Gagal mencatat aktivitas:", error);
    }

    return result;
  }

  async list(limit = DEFAULT_LIMIT): Promise<AuditLogRow[]> {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return logs.map((log) => ({
      id: log.id,
      at: log.createdAt.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }),
      actorName: log.actorName,
      actionLabel: AUDIT_ACTIONS[log.action as AuditAction] ?? log.action,
      area: AUDIT_ENTITIES[log.entity as AuditEntity] ?? log.entity,
      targetName: log.targetName,
      detail: log.detail,
    }));
  }
}

export const auditService = new AuditService();
