"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function usePrintInLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    let wasDark = false;
    const beforePrint = () => {
      wasDark = root.classList.contains("dark");
      root.classList.remove("dark");
    };
    const afterPrint = () => {
      if (wasDark) root.classList.add("dark");
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  usePrintInLightMode();
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
