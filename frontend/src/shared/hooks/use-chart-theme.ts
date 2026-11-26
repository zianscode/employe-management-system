"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ChartColors {
  grid: string;
  axis: string;
  cursor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  brand: string;
  accent: string;
  warning: string;
  danger: string;
  palette: string[];
}

const FALLBACK: ChartColors = {
  grid: "#e3e6ec",
  axis: "#5b6474",
  cursor: "#f0f2f6",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e3e6ec",
  tooltipText: "#0f172a",
  brand: "#023074",
  accent: "#139957",
  warning: "#d97706",
  danger: "#dc2626",
  palette: ["#023074", "#139957", "#5b84c4", "#d97706", "#dc2626"],
};

function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  const palette = [1, 2, 3, 4, 5].map((i) => read(`--chart-${i}`, FALLBACK.palette[i - 1]));

  return {
    grid: read("--border", FALLBACK.grid),
    axis: read("--muted-foreground", FALLBACK.axis),
    cursor: read("--muted", FALLBACK.cursor),
    tooltipBg: read("--popover", FALLBACK.tooltipBg),
    tooltipBorder: read("--border", FALLBACK.tooltipBorder),
    tooltipText: read("--popover-foreground", FALLBACK.tooltipText),
    brand: palette[0],
    accent: palette[1],
    warning: palette[3],
    danger: palette[4],
    palette,
  };
}

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    setColors(readColors());
  }, [resolvedTheme]);

  return {
    ...colors,
    tick: { fill: colors.axis, fontSize: 12 },
    tooltipStyle: {
      backgroundColor: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: 8,
      boxShadow: "0 1px 3px rgb(0 0 0 / 0.12)",
      color: colors.tooltipText,
      fontSize: 12,
      padding: "8px 10px",
    },
  };
}
