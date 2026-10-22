export const BRAND_COLORS = {
  brand: "#023074",
  brandDark: "#011d47",
  brandLight: "#1d4f9c",
  accent: "#139957",
  accentDark: "#0d7a45",
} as const;

export const CHART_COLORS = [BRAND_COLORS.brand, BRAND_COLORS.accent, "#5b84c4", "#94a3b8", "#d97706", "#0e7490"];

export const CHART_AXIS_TICK = { fill: "#6b7280", fontSize: 12 };

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgb(0 0 0 / 0.08)",
  fontSize: 12,
  padding: "8px 10px",
};
