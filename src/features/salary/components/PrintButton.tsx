"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl font-bold text-sm shadow print:hidden"
    >
      <Printer size={16} />
      Cetak / Simpan PDF
    </button>
  );
}
