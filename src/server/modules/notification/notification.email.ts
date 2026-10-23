import { BRAND_COLORS } from "@/shared/constants/theme";

interface NotificationEmailInput {
  greetingName: string;
  message: string;
  details?: [label: string, value: string][];
  actionLabel: string;
  actionUrl: string;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function notificationEmail({ greetingName, message, details = [], actionLabel, actionUrl }: NotificationEmailInput): string {
  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding: 4px 16px 4px 0; color: #6b7280;">${escapeHtml(label)}</td><td style="padding: 4px 0; color: #111827;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; line-height: 1.5;">
      <p style="color: #111827; margin: 0 0 12px;">Halo ${escapeHtml(greetingName)},</p>
      <p style="color: #374151; margin: 0 0 16px;">${escapeHtml(message)}</p>
      ${rows ? `<table style="border-collapse: collapse; margin: 0 0 20px;">${rows}</table>` : ""}
      <a href="${actionUrl}" style="background-color: ${BRAND_COLORS.brand}; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">${escapeHtml(actionLabel)}</a>
      <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">Email ini dikirim otomatis oleh Employee Management System.</p>
    </div>
  `;
}
