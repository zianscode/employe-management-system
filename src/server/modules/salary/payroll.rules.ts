import type { PtkpStatus } from "@prisma/client";
import { JKK_RISK_GROUPS } from "@/shared/constants/payroll";

export const BPJS_RATES = {
  kesehatanEmployee: 0.01,
  kesehatanEmployer: 0.04,
  jhtEmployee: 0.02,
  jhtEmployer: 0.037,
  jpEmployee: 0.01,
  jpEmployer: 0.02,
  jkmEmployer: 0.003,
};

export const JKK_RISK_GROUPS_BPS: number[] = JKK_RISK_GROUPS.map((g) => g.bps);

export interface BpjsSettings {
  bpjsKesehatanWageCap: number;
  jpWageCap: number;
  jkkRateBps: number;
  bpjsMinimumWage: number;
}

export interface BpjsContributions {
  bpjsKesEmployee: number;
  bpjsKesEmployer: number;
  jhtEmployee: number;
  jhtEmployer: number;
  jpEmployee: number;
  jpEmployer: number;
  jkkEmployer: number;
  jkmEmployer: number;
}

const ZERO_BPJS: BpjsContributions = {
  bpjsKesEmployee: 0,
  bpjsKesEmployer: 0,
  jhtEmployee: 0,
  jhtEmployer: 0,
  jpEmployee: 0,
  jpEmployer: 0,
  jkkEmployer: 0,
  jkmEmployer: 0,
};

export function calculateBpjs(
  wage: number,
  settings: BpjsSettings,
  enrolled: { kesehatan: boolean; ketenagakerjaan: boolean }
): BpjsContributions {
  const base = Math.max(wage, settings.bpjsMinimumWage);
  const kesBase = Math.min(base, settings.bpjsKesehatanWageCap);
  const jpBase = Math.min(base, settings.jpWageCap);
  const pct = (amount: number, rate: number) => Math.round(amount * rate);

  const result = { ...ZERO_BPJS };
  if (enrolled.kesehatan) {
    result.bpjsKesEmployee = pct(kesBase, BPJS_RATES.kesehatanEmployee);
    result.bpjsKesEmployer = pct(kesBase, BPJS_RATES.kesehatanEmployer);
  }
  if (enrolled.ketenagakerjaan) {
    result.jhtEmployee = pct(base, BPJS_RATES.jhtEmployee);
    result.jhtEmployer = pct(base, BPJS_RATES.jhtEmployer);
    result.jpEmployee = pct(jpBase, BPJS_RATES.jpEmployee);
    result.jpEmployer = pct(jpBase, BPJS_RATES.jpEmployer);
    result.jkkEmployer = pct(base, settings.jkkRateBps / 10_000);
    result.jkmEmployer = pct(base, BPJS_RATES.jkmEmployer);
  }
  return result;
}

export const PTKP_AMOUNTS: Record<PtkpStatus, number> = {
  TK0: 54_000_000,
  TK1: 58_500_000,
  TK2: 63_000_000,
  TK3: 67_500_000,
  K0: 58_500_000,
  K1: 63_000_000,
  K2: 67_500_000,
  K3: 72_000_000,
};

type TerCategory = "A" | "B" | "C";

const TER_CATEGORY: Record<PtkpStatus, TerCategory> = {
  TK0: "A",
  TK1: "A",
  K0: "A",
  TK2: "B",
  TK3: "B",
  K1: "B",
  K2: "B",
  K3: "C",
};

const TER_TABLES: Record<TerCategory, [upperBound: number, ratePercent: number][]> = {
  A: [
    [5_400_000, 0], [5_650_000, 0.25], [5_950_000, 0.5], [6_300_000, 0.75], [6_750_000, 1], [7_500_000, 1.25],
    [8_550_000, 1.5], [9_650_000, 1.75], [10_050_000, 2], [10_350_000, 2.25], [10_700_000, 2.5], [11_050_000, 3],
    [11_600_000, 3.5], [12_500_000, 4], [13_750_000, 5], [15_100_000, 6], [16_950_000, 7], [19_750_000, 8],
    [24_150_000, 9], [26_450_000, 10], [28_000_000, 11], [30_050_000, 12], [32_400_000, 13], [35_400_000, 14],
    [39_100_000, 15], [43_850_000, 16], [47_800_000, 17], [51_400_000, 18], [56_300_000, 19], [62_200_000, 20],
    [68_600_000, 21], [77_500_000, 22], [89_000_000, 23], [103_000_000, 24], [125_000_000, 25], [157_000_000, 26],
    [206_000_000, 27], [337_000_000, 28], [454_000_000, 29], [550_000_000, 30], [695_000_000, 31], [910_000_000, 32],
    [1_400_000_000, 33], [Infinity, 34],
  ],
  B: [
    [6_200_000, 0], [6_500_000, 0.25], [6_850_000, 0.5], [7_300_000, 0.75], [9_200_000, 1], [10_750_000, 1.5],
    [11_250_000, 2], [11_600_000, 2.5], [12_600_000, 3], [13_600_000, 4], [14_950_000, 5], [16_400_000, 6],
    [18_450_000, 7], [21_850_000, 8], [26_000_000, 9], [27_700_000, 10], [29_350_000, 11], [31_450_000, 12],
    [33_950_000, 13], [37_100_000, 14], [41_100_000, 15], [45_800_000, 16], [49_500_000, 17], [53_800_000, 18],
    [58_500_000, 19], [64_000_000, 20], [71_000_000, 21], [80_000_000, 22], [93_000_000, 23], [109_000_000, 24],
    [129_000_000, 25], [163_000_000, 26], [211_000_000, 27], [374_000_000, 28], [459_000_000, 29], [555_000_000, 30],
    [704_000_000, 31], [957_000_000, 32], [1_405_000_000, 33], [Infinity, 34],
  ],
  C: [
    [6_600_000, 0], [6_950_000, 0.25], [7_350_000, 0.5], [7_800_000, 0.75], [8_850_000, 1], [9_800_000, 1.25],
    [10_950_000, 1.5], [11_200_000, 1.75], [12_050_000, 2], [12_950_000, 3], [14_150_000, 4], [15_550_000, 5],
    [17_050_000, 6], [19_500_000, 7], [22_700_000, 8], [26_600_000, 9], [28_100_000, 10], [30_100_000, 11],
    [32_600_000, 12], [35_400_000, 13], [38_900_000, 14], [43_000_000, 15], [47_400_000, 16], [51_200_000, 17],
    [55_800_000, 18], [60_400_000, 19], [66_700_000, 20], [74_500_000, 21], [83_200_000, 22], [95_600_000, 23],
    [110_000_000, 24], [134_000_000, 25], [169_000_000, 26], [221_000_000, 27], [390_000_000, 28], [463_000_000, 29],
    [561_000_000, 30], [709_000_000, 31], [965_000_000, 32], [1_419_000_000, 33], [Infinity, 34],
  ],
};

export function terRatePercent(ptkp: PtkpStatus, monthlyGross: number): { category: TerCategory; rate: number } {
  const category = TER_CATEGORY[ptkp];
  const [, rate] = TER_TABLES[category].find(([upper]) => monthlyGross <= upper)!;
  return { category, rate };
}

export function monthlyTerPph21(ptkp: PtkpStatus, monthlyGross: number) {
  const { category, rate } = terRatePercent(ptkp, monthlyGross);
  return { amount: Math.floor((monthlyGross * rate) / 100), method: `TER ${category} ${rate}%` };
}

const PASAL_17_BRACKETS: [upTo: number, rate: number][] = [
  [60_000_000, 0.05],
  [250_000_000, 0.15],
  [500_000_000, 0.25],
  [5_000_000_000, 0.3],
  [Infinity, 0.35],
];

export function pasal17Tax(taxableIncome: number): number {
  let remaining = Math.max(0, taxableIncome);
  let previousLimit = 0;
  let tax = 0;
  for (const [limit, rate] of PASAL_17_BRACKETS) {
    const slice = Math.min(remaining, limit - previousLimit);
    tax += slice * rate;
    remaining -= slice;
    previousLimit = limit;
    if (remaining <= 0) break;
  }
  return Math.floor(tax);
}

const BIAYA_JABATAN_RATE = 0.05;
const BIAYA_JABATAN_MONTHLY_CAP = 500_000;

export interface AnnualPph21Input {
  ptkp: PtkpStatus;
  annualGross: number;
  annualPensionContribution: number;
  monthsWorked: number;
  pph21AlreadyWithheld: number;
}

export function annualPph21(input: AnnualPph21Input) {
  const biayaJabatan = Math.min(
    Math.floor(input.annualGross * BIAYA_JABATAN_RATE),
    BIAYA_JABATAN_MONTHLY_CAP * input.monthsWorked
  );
  const neto = input.annualGross - biayaJabatan - input.annualPensionContribution;
  const pkp = Math.max(0, Math.floor((neto - PTKP_AMOUNTS[input.ptkp]) / 1000) * 1000);
  const annualTax = pasal17Tax(pkp);

  return {
    biayaJabatan,
    neto,
    pkp,
    annualTax,
    amount: annualTax - input.pph21AlreadyWithheld,
    method: `Pasal 17 (setahun Rp${annualTax.toLocaleString("id-ID")})`,
  };
}
