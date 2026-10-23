import { describe, expect, it } from "vitest";
import { notificationEmail } from "./notification.email";

describe("notificationEmail", () => {
  const html = notificationEmail({
    greetingName: "Rina",
    message: "Pengajuan cuti Anda disetujui.",
    details: [["Alasan", '<script>alert("x")</script>']],
    actionLabel: "Lihat pengajuan",
    actionUrl: "http://localhost:3000/dashboard/leave",
  });

  it("menampilkan sapaan, pesan, dan tombol", () => {
    expect(html).toContain("Halo Rina");
    expect(html).toContain("Pengajuan cuti Anda disetujui.");
    expect(html).toContain('href="http://localhost:3000/dashboard/leave"');
  });

  it("meng-escape isian dari pengguna", () => {
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
