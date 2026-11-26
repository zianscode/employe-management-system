import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutProvider from "@/features/layout/components/LayoutProvider";
import { SessionProvider } from "@/lib/api/session";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Sistem manajemen karyawan: absensi, cuti, penggajian, dan laporan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans text-sm">
        <ThemeProvider>
          <SessionProvider>
            <TooltipProvider delayDuration={300}>
              <LayoutProvider>{children}</LayoutProvider>
            </TooltipProvider>
            <Toaster position="top-right" closeButton richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
