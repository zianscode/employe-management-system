export const RESET_PASSWORD_SUBJECT = "Reset Password Akun EMS Pro Anda";

export function resetPasswordEmail(resetLink: string, validHours: number): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #1e293b; margin-bottom: 20px;">Halo,</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Kami menerima permintaan untuk mereset password akun Anda di <strong>EMS Pro</strong>.</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Silakan klik tombol di bawah ini untuk membuat password baru. Link ini hanya berlaku selama ${validHours} jam.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #E02F75; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Sekarang</a>
      </div>

      <p style="color: #64748b; font-size: 14px;">Atau copy link berikut ke browser Anda:</p>
      <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">${resetLink}</p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Akun Anda tetap aman.</p>
    </div>
  `;
}
