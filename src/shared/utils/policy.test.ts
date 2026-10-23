import { describe, expect, it } from "vitest";
import { validatePasswordStrength } from "./password-policy";
import { describeLeaveNextStep } from "./leave";

describe("validatePasswordStrength", () => {
  it("menolak password yang terlalu pendek", () => {
    expect(validatePasswordStrength("ab12")).not.toBeNull();
  });

  it("menolak password tanpa angka atau tanpa huruf", () => {
    expect(validatePasswordStrength("abcdefgh")).not.toBeNull();
    expect(validatePasswordStrength("12345678")).not.toBeNull();
  });

  it("menerima password minimal 8 karakter dengan huruf dan angka", () => {
    expect(validatePasswordStrength("abcd1234")).toBeNull();
  });
});

describe("describeLeaveNextStep", () => {
  it("menyebut atasan untuk pengajuan yang baru masuk", () => {
    expect(describeLeaveNextStep("PENDING", "Rina")).toBe("Menunggu persetujuan atasan (Rina)");
  });

  it("langsung ke HR jika tidak ada atasan", () => {
    expect(describeLeaveNextStep("PENDING", null)).toBe("Menunggu persetujuan HR");
  });

  it("menunggu HR setelah disetujui atasan", () => {
    expect(describeLeaveNextStep("MANAGER_APPROVED", "Rina")).toBe("Menunggu persetujuan akhir HR");
  });

  it("tidak ada langkah berikutnya untuk status final", () => {
    expect(describeLeaveNextStep("HR_APPROVED")).toBeNull();
    expect(describeLeaveNextStep("REJECTED")).toBeNull();
  });
});
