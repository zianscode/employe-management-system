import { after } from "next/server";
import { prisma } from "@/server/db/prisma";
import { sendMail } from "@/server/utils/mailer";
import { ADMIN_ROLES } from "@/shared/constants/roles";
import { LEAVE_TYPE_LABELS } from "@/shared/constants/leave";
import { formatCurrency } from "@/shared/utils/format";
import { formatDate, formatPeriod } from "@/shared/utils/date";
import { notificationEmail } from "./notification.email";

const STATUS_TEXT: Record<string, string> = {
  MANAGER_APPROVED: "disetujui atasan dan sekarang menunggu persetujuan HR",
  HR_APPROVED: "disetujui",
  REJECTED: "ditolak",
  APPROVED: "disetujui",
};

const appUrl = (path: string) => `${process.env.AUTH_URL || "http://localhost:3000"}${path}`;

interface Recipient {
  email: string;
  name: string;
}

class NotificationService {
  private isConfigured() {
    return Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);
  }

  private async send(recipients: Recipient[], subject: string, build: (name: string) => string) {
    if (!this.isConfigured() || recipients.length === 0) return;
    const unique = Array.from(new Map(recipients.map((r) => [r.email, r])).values());
    const results = await Promise.allSettled(unique.map((r) => sendMail({ to: r.email, subject, html: build(r.name) })));
    results.forEach((result) => {
      if (result.status === "rejected") console.error("[NOTIFICATION] Gagal mengirim email:", result.reason);
    });
  }

  private async hrRecipients(excludeEmployeeId?: string): Promise<Recipient[]> {
    const users = await prisma.user.findMany({
      where: {
        role: { name: { in: ADMIN_ROLES } },
        employee: { status: { in: ["ACTIVE", "PROBATION"] }, ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}) },
      },
      select: { email: true, employee: { select: { name: true } } },
    });
    return users.map((u) => ({ email: u.email, name: u.employee?.name ?? "HR" }));
  }

  async leaveSubmitted(leaveId: string) {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: { select: { id: true, name: true, manager: { select: { name: true, email: true } } } } },
    });
    if (!leave) return;

    const recipients = leave.employee.manager
      ? [{ email: leave.employee.manager.email, name: leave.employee.manager.name }]
      : await this.hrRecipients(leave.employee.id);

    await this.send(recipients, `Pengajuan cuti baru dari ${leave.employee.name}`, (name) =>
      notificationEmail({
        greetingName: name,
        message: `${leave.employee.name} mengajukan cuti dan menunggu persetujuan Anda.`,
        details: [
          ["Jenis", LEAVE_TYPE_LABELS[leave.type] ?? leave.type],
          ["Tanggal", `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}`],
          ["Durasi", `${leave.duration} hari kerja`],
          ["Alasan", leave.reason],
        ],
        actionLabel: "Buka halaman cuti",
        actionUrl: appUrl("/dashboard/leave"),
      }),
    );
  }

  async leaveDecided(leaveId: string) {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });
    if (!leave || !STATUS_TEXT[leave.status]) return;

    const details: [string, string][] = [
      ["Jenis", LEAVE_TYPE_LABELS[leave.type] ?? leave.type],
      ["Tanggal", `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}`],
    ];
    if (leave.rejectionReason) details.push(["Alasan penolakan", leave.rejectionReason]);

    await this.send([{ email: leave.employee.email, name: leave.employee.name }], `Pengajuan cuti Anda ${STATUS_TEXT[leave.status]}`, (name) =>
      notificationEmail({
        greetingName: name,
        message: `Pengajuan cuti Anda ${STATUS_TEXT[leave.status]}.`,
        details,
        actionLabel: "Lihat pengajuan",
        actionUrl: appUrl("/dashboard/leave"),
      }),
    );

    if (leave.status === "MANAGER_APPROVED") {
      await this.send(await this.hrRecipients(leave.employee.id), `Cuti ${leave.employee.name} menunggu persetujuan HR`, (name) =>
        notificationEmail({
          greetingName: name,
          message: `Atasan sudah menyetujui cuti ${leave.employee.name}. Pengajuan ini menunggu persetujuan akhir HR.`,
          details,
          actionLabel: "Buka halaman cuti",
          actionUrl: appUrl("/dashboard/leave"),
        }),
      );
    }
  }

  async correctionDecided(correctionId: string) {
    const correction = await prisma.attendanceCorrection.findUnique({
      where: { id: correctionId },
      include: { employee: { select: { name: true, email: true } } },
    });
    if (!correction || !STATUS_TEXT[correction.status]) return;

    const details: [string, string][] = [["Tanggal", formatDate(correction.date)]];
    if (correction.rejectionReason) details.push(["Alasan penolakan", correction.rejectionReason]);

    await this.send(
      [{ email: correction.employee.email, name: correction.employee.name }],
      `Koreksi absensi Anda ${STATUS_TEXT[correction.status]}`,
      (name) =>
        notificationEmail({
          greetingName: name,
          message: `Pengajuan koreksi absensi Anda ${STATUS_TEXT[correction.status]}.`,
          details,
          actionLabel: "Lihat absensi",
          actionUrl: appUrl("/dashboard/attendance"),
        }),
    );
  }

  async salariesPaid(where: { id: string } | { periodMonth: number; periodYear: number; paidSince: Date }) {
    const salaries = await prisma.salary.findMany({
      where:
        "id" in where
          ? { id: where.id, isPaid: true }
          : { periodMonth: where.periodMonth, periodYear: where.periodYear, isPaid: true, paidAt: { gte: where.paidSince } },
      include: { employee: { select: { name: true, email: true } } },
    });

    await Promise.all(
      salaries.map((salary) => {
        const period = formatPeriod(salary.periodMonth, salary.periodYear);
        return this.send([{ email: salary.employee.email, name: salary.employee.name }], `Gaji ${period} sudah dibayar`, (name) =>
          notificationEmail({
            greetingName: name,
            message: `Gaji Anda untuk periode ${period} sudah dibayar.`,
            details: [["Gaji bersih", formatCurrency(salary.totalNet)]],
            actionLabel: "Buka slip gaji",
            actionUrl: appUrl(`/dashboard/salary/${salary.id}/slip`),
          }),
        );
      }),
    );
  }
}

export const notificationService = new NotificationService();

export function notifyLater(task: () => Promise<void>) {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error("[NOTIFICATION] Gagal memproses notifikasi:", error);
    }
  });
}
