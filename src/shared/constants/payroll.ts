export const PTKP_OPTIONS = [
  { value: "TK0", label: "TK/0 - Tidak kawin, tanpa tanggungan" },
  { value: "TK1", label: "TK/1 - Tidak kawin, 1 tanggungan" },
  { value: "TK2", label: "TK/2 - Tidak kawin, 2 tanggungan" },
  { value: "TK3", label: "TK/3 - Tidak kawin, 3 tanggungan" },
  { value: "K0", label: "K/0 - Kawin, tanpa tanggungan" },
  { value: "K1", label: "K/1 - Kawin, 1 tanggungan" },
  { value: "K2", label: "K/2 - Kawin, 2 tanggungan" },
  { value: "K3", label: "K/3 - Kawin, 3 tanggungan" },
] as const;

export type PtkpValue = (typeof PTKP_OPTIONS)[number]["value"];

export const PTKP_LABELS: Record<PtkpValue, string> = {
  TK0: "TK/0",
  TK1: "TK/1",
  TK2: "TK/2",
  TK3: "TK/3",
  K0: "K/0",
  K1: "K/1",
  K2: "K/2",
  K3: "K/3",
};

export const JKK_RISK_GROUPS = [
  { bps: 24, label: "0,24% - Risiko sangat rendah (kantor)" },
  { bps: 54, label: "0,54% - Risiko rendah" },
  { bps: 89, label: "0,89% - Risiko sedang" },
  { bps: 127, label: "1,27% - Risiko tinggi" },
  { bps: 174, label: "1,74% - Risiko sangat tinggi" },
] as const;
