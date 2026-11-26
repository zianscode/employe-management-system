"use client";

import { Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()} className="print:hidden">
      <Printer className="h-4 w-4" />
      Cetak / simpan PDF
    </Button>
  );
}
