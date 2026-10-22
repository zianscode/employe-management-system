import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutProvider from "@/features/layout/components/LayoutProvider";
import { NextAuthProvider } from "@/shared/providers/NextAuthProvider";
import { Toaster } from "sonner";

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
    <html lang="id" className={inter.variable}>
      <body className="font-sans text-sm">
        <NextAuthProvider>
          <LayoutProvider>{children}</LayoutProvider>
          <Toaster position="top-right" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
