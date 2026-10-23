import { describe, expect, it } from "vitest";
import { annualPph21, calculateBpjs, monthlyTerPph21, pasal17Tax, terRatePercent } from "./payroll.rules";

const settings = {
  bpjsKesehatanWageCap: 12_000_000,
  jpWageCap: 11_086_300,
  jkkRateBps: 24,
  bpjsMinimumWage: 0,
};
const enrolled = { kesehatan: true, ketenagakerjaan: true };

describe("calculateBpjs", () => {
  it("menghitung iuran untuk upah di bawah batas", () => {
    expect(calculateBpjs(10_000_000, settings, enrolled)).toEqual({
      bpjsKesEmployee: 100_000,
      bpjsKesEmployer: 400_000,
      jhtEmployee: 200_000,
      jhtEmployer: 370_000,
      jpEmployee: 100_000,
      jpEmployer: 200_000,
      jkkEmployer: 24_000,
      jkmEmployer: 30_000,
    });
  });

  it("memakai batas upah BPJS Kesehatan dan JP, tapi JHT tetap dari upah penuh", () => {
    const result = calculateBpjs(20_000_000, settings, enrolled);
    expect(result.bpjsKesEmployee).toBe(120_000);
    expect(result.jpEmployee).toBe(110_863);
    expect(result.jhtEmployee).toBe(400_000);
  });

  it("memakai upah minimum sebagai dasar terendah", () => {
    const result = calculateBpjs(3_000_000, { ...settings, bpjsMinimumWage: 5_000_000 }, enrolled);
    expect(result.jhtEmployee).toBe(100_000);
  });

  it("tidak memotong iuran program yang tidak diikuti", () => {
    const result = calculateBpjs(10_000_000, settings, { kesehatan: false, ketenagakerjaan: false });
    expect(Object.values(result).every((v) => v === 0)).toBe(true);
  });
});

describe("TER PPh 21", () => {
  it("memetakan status PTKP ke kategori TER", () => {
    expect(terRatePercent("TK0", 5_000_000).category).toBe("A");
    expect(terRatePercent("K1", 5_000_000).category).toBe("B");
    expect(terRatePercent("K3", 5_000_000).category).toBe("C");
  });

  it("memakai tarif TER kategori A sesuai PP 58/2023", () => {
    expect(terRatePercent("TK0", 5_400_000).rate).toBe(0);
    expect(terRatePercent("TK0", 10_000_000).rate).toBe(2);
    expect(terRatePercent("TK0", 12_000_000).rate).toBe(4);
  });

  it("membulatkan potongan bulanan ke bawah", () => {
    expect(monthlyTerPph21("TK0", 10_000_000)).toEqual({ amount: 200_000, method: "TER A 2%" });
  });
});

describe("Pasal 17", () => {
  it("menghitung pajak progresif per lapisan", () => {
    expect(pasal17Tax(0)).toBe(0);
    expect(pasal17Tax(60_000_000)).toBe(3_000_000);
    expect(pasal17Tax(100_000_000)).toBe(9_000_000);
    expect(pasal17Tax(300_000_000)).toBe(3_000_000 + 28_500_000 + 12_500_000);
  });
});

describe("annualPph21", () => {
  it("menghitung PPh 21 setahun di bulan Desember", () => {
    const result = annualPph21({
      ptkp: "TK0",
      annualGross: 120_000_000,
      annualPensionContribution: 3_600_000,
      monthsWorked: 12,
      pph21AlreadyWithheld: 2_200_000,
    });
    expect(result.biayaJabatan).toBe(6_000_000);
    expect(result.neto).toBe(110_400_000);
    expect(result.pkp).toBe(56_400_000);
    expect(result.annualTax).toBe(2_820_000);
    expect(result.amount).toBe(620_000);
  });

  it("membatasi biaya jabatan Rp500.000 per bulan kerja", () => {
    const result = annualPph21({
      ptkp: "TK0",
      annualGross: 300_000_000,
      annualPensionContribution: 0,
      monthsWorked: 12,
      pph21AlreadyWithheld: 0,
    });
    expect(result.biayaJabatan).toBe(6_000_000);
  });
});
