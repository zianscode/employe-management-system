import { prisma } from "@/server/db/prisma";
import { LeaveStatus, LeaveType, Prisma } from "@prisma/client";
import { CurrentUser } from "@/server/auth/guard";
import { employeeScopeFor } from "@/server/auth/scope";
import { holidayService } from "@/server/modules/settings/holiday.service";
import { ROLES, isAdminRole } from "@/shared/constants/roles";
import { LeaveBalance, LeavePreview, LeaveRequest, LeaveRequestInput } from "@/shared/types/leave.types";
import { describeLeaveNextStep } from "@/shared/utils/leave";
import { countWorkingDays, dateKeyToDate, formatDate, toDateKey } from "@/shared/utils/date";

const OPEN_STATUSES: LeaveStatus[] = [LeaveStatus.PENDING, LeaveStatus.MANAGER_APPROVED];

const leaveInclude = {
  employee: { select: { id: true, name: true, nip: true, managerId: true, manager: { select: { name: true } } } },
  managerApprover: { select: { name: true } },
  hrApprover: { select: { name: true } },
  rejectedBy: { select: { name: true } },
} satisfies Prisma.LeaveRequestInclude;

type LeaveWithRelations = Prisma.LeaveRequestGetPayload<{ include: typeof leaveInclude }>;

class LeaveService {
  scopeFor(user: CurrentUser): Prisma.LeaveRequestWhereInput {
    return { employee: employeeScopeFor(user) };
  }

  private isOwn(req: LeaveWithRelations, user: CurrentUser) {
    return req.employeeId === user.employeeId;
  }

  private canDecide(req: LeaveWithRelations, user: CurrentUser) {
    if (!OPEN_STATUSES.includes(req.status) || !user.employeeId) return false;
    if (this.isOwn(req, user) && user.role !== ROLES.SUPER_ADMIN) return false;
    if (isAdminRole(user.role)) return true;
    return user.role === ROLES.MANAGER && req.status === LeaveStatus.PENDING && req.employee.managerId === user.employeeId;
  }

  private canCancel(req: LeaveWithRelations, user: CurrentUser) {
    return OPEN_STATUSES.includes(req.status) && this.isOwn(req, user);
  }

  private toDto(req: LeaveWithRelations, user: CurrentUser): LeaveRequest {
    const approver = (name: string | undefined, at: Date | null) => (name ? { name, at: at?.toISOString() ?? null } : null);
    const canDecide = this.canDecide(req, user);
    return {
      id: req.id,
      employeeId: req.employeeId,
      nip: req.employee.nip || "-",
      nama: req.employee.name,
      tipeCuti: req.type,
      tanggalMulai: formatDate(req.startDate),
      tanggalSelesai: formatDate(req.endDate),
      durasi: req.duration,
      status: req.status,
      reason: req.reason,
      managerApprover: approver(req.managerApprover?.name, req.managerApprovedAt),
      hrApprover: approver(req.hrApprover?.name, req.hrApprovedAt),
      rejectedBy: approver(req.rejectedBy?.name, req.rejectedAt),
      rejectionReason: req.rejectionReason,
      nextStep: describeLeaveNextStep(req.status, req.employee.manager?.name),
      canApprove: canDecide,
      canReject: canDecide,
      canCancel: this.canCancel(req, user),
    };
  }

  private async findForAction(id: string, user: CurrentUser) {
    const req = await prisma.leaveRequest.findFirst({
      where: { AND: [{ id }, this.scopeFor(user)] },
      include: leaveInclude,
    });
    if (!req) throw new Error("Pengajuan cuti tidak ditemukan");
    return req;
  }

  private async sumAnnualDays(employeeId: string, year: number, statuses: LeaveStatus[], excludeId?: string) {
    const result = await prisma.leaveRequest.aggregate({
      where: {
        employeeId,
        type: LeaveType.ANNUAL,
        status: { in: statuses },
        startDate: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
        NOT: excludeId ? { id: excludeId } : undefined,
      },
      _sum: { duration: true },
    });
    return result._sum.duration || 0;
  }

  async getBalance(employeeId: string, year = Number(toDateKey().slice(0, 4))): Promise<LeaveBalance> {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { leaveQuota: true } });
    const quota = employee?.leaveQuota ?? 0;
    const used = await this.sumAnnualDays(employeeId, year, [LeaveStatus.HR_APPROVED]);
    return { year, quota, used, remaining: Math.max(0, quota - used) };
  }

  async preview(user: CurrentUser, input: { employeeId?: string; startDate: string; endDate?: string }): Promise<LeavePreview> {
    const employeeId = isAdminRole(user.role) && input.employeeId ? input.employeeId : user.employeeId;
    if (!employeeId) throw new Error("Profil karyawan tidak ditemukan");

    const start = dateKeyToDate(input.startDate);
    if (isNaN(start.getTime())) throw new Error("Tanggal tidak valid");
    const end = input.endDate ? dateKeyToDate(input.endDate) : null;
    const year = start.getUTCFullYear();

    const [{ quota, used }, reserved, workingDays, employee] = await Promise.all([
      this.getBalance(employeeId, year),
      this.sumAnnualDays(employeeId, year, OPEN_STATUSES),
      end && !isNaN(end.getTime()) && end >= start
        ? holidayService.keysBetween(start, end).then((holidays) => countWorkingDays(start, end, holidays))
        : Promise.resolve(null),
      prisma.employee.findUnique({ where: { id: employeeId }, select: { manager: { select: { name: true } } } }),
    ]);

    return {
      year,
      quota,
      used,
      pending: reserved,
      available: Math.max(0, quota - used - reserved),
      workingDays,
      managerName: employee?.manager?.name ?? null,
    };
  }

  async list(user: CurrentUser) {
    const requests = await prisma.leaveRequest.findMany({
      where: this.scopeFor(user),
      include: leaveInclude,
      orderBy: { createdAt: "desc" },
    });
    return requests.map((r) => this.toDto(r, user));
  }

  async countAwaitingDecision(user: CurrentUser) {
    if (!user.employeeId) return 0;
    const notOwn = user.role === ROLES.SUPER_ADMIN ? {} : { employeeId: { not: user.employeeId } };

    if (isAdminRole(user.role)) {
      return prisma.leaveRequest.count({ where: { status: { in: OPEN_STATUSES }, ...notOwn } });
    }
    if (user.role === ROLES.MANAGER) {
      return prisma.leaveRequest.count({
        where: { status: LeaveStatus.PENDING, employee: { managerId: user.employeeId }, ...notOwn },
      });
    }
    return 0;
  }

  async getStats(user: CurrentUser) {
    const scope = this.scopeFor(user);
    const count = (where: Prisma.LeaveRequestWhereInput) => prisma.leaveRequest.count({ where: { AND: [scope, where] } });

    const [total, approved, pending, rejected] = await Promise.all([
      count({}),
      count({ status: LeaveStatus.HR_APPROVED }),
      count({ status: { in: OPEN_STATUSES } }),
      count({ status: LeaveStatus.REJECTED }),
    ]);

    return [
      { label: "Total Permohonan", value: total.toString(), change: "", type: "neutral" as const },
      { label: "Disetujui", value: approved.toString(), change: "", type: "success" as const },
      { label: "Pending", value: pending.toString(), change: "", type: "warning" as const },
      { label: "Ditolak", value: rejected.toString(), change: "", type: "danger" as const },
    ];
  }

  async request(user: CurrentUser, input: LeaveRequestInput) {
    const employeeId = isAdminRole(user.role) && input.employeeId ? input.employeeId : user.employeeId;
    if (!employeeId) throw new Error("Profil karyawan tidak ditemukan");
    if (!input.reason?.trim()) throw new Error("Alasan cuti wajib diisi");
    if (!Object.values(LeaveType).includes(input.type)) throw new Error("Jenis cuti tidak valid");

    const start = dateKeyToDate(input.startDate);
    const end = dateKeyToDate(input.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Tanggal tidak valid");
    if (end < start) throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai");

    const duration = countWorkingDays(start, end, await holidayService.keysBetween(start, end));
    if (duration === 0) throw new Error("Rentang tanggal tidak mengandung hari kerja (Senin-Jumat, bukan hari libur)");

    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: [...OPEN_STATUSES, LeaveStatus.HR_APPROVED] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (overlapping) throw new Error("Sudah ada pengajuan cuti pada rentang tanggal tersebut");

    if (input.type === LeaveType.ANNUAL) {
      const year = start.getUTCFullYear();
      const { quota } = await this.getBalance(employeeId, year);
      const reserved = await this.sumAnnualDays(employeeId, year, [...OPEN_STATUSES, LeaveStatus.HR_APPROVED]);
      if (reserved + duration > quota) {
        throw new Error(`Sisa kuota cuti tahunan ${year} tidak cukup (tersisa ${Math.max(0, quota - reserved)} hari)`);
      }
    }

    return prisma.leaveRequest.create({
      data: {
        employeeId,
        type: input.type,
        startDate: start,
        endDate: end,
        duration,
        reason: input.reason.trim(),
        status: LeaveStatus.PENDING,
      },
    });
  }

  async approve(id: string, user: CurrentUser) {
    const req = await this.findForAction(id, user);
    if (!this.canDecide(req, user)) throw new Error("Anda tidak berwenang menyetujui pengajuan ini");

    if (user.role === ROLES.MANAGER) {
      return prisma.leaveRequest.update({
        where: { id },
        data: { status: LeaveStatus.MANAGER_APPROVED, managerApproverId: user.employeeId, managerApprovedAt: new Date() },
      });
    }

    if (req.type === LeaveType.ANNUAL) {
      const year = req.startDate.getUTCFullYear();
      const { quota } = await this.getBalance(req.employeeId, year);
      const approved = await this.sumAnnualDays(req.employeeId, year, [LeaveStatus.HR_APPROVED], req.id);
      if (approved + req.duration > quota) throw new Error("Kuota cuti tahunan karyawan tidak mencukupi");
    }

    return prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.HR_APPROVED, hrApproverId: user.employeeId, hrApprovedAt: new Date() },
    });
  }

  async reject(id: string, user: CurrentUser, reason: string) {
    const req = await this.findForAction(id, user);
    if (!this.canDecide(req, user)) throw new Error("Anda tidak berwenang menolak pengajuan ini");
    if (!reason?.trim()) throw new Error("Alasan penolakan wajib diisi");

    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        rejectedById: user.employeeId,
        rejectedAt: new Date(),
        rejectionReason: reason.trim(),
      },
    });
  }

  async cancel(id: string, user: CurrentUser) {
    const req = await this.findForAction(id, user);
    if (!this.canCancel(req, user)) throw new Error("Pengajuan ini tidak dapat dibatalkan");
    return prisma.leaveRequest.update({ where: { id }, data: { status: LeaveStatus.CANCELLED } });
  }
}

export const leaveService = new LeaveService();
