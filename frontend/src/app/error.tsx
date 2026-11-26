"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/shared/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Halaman ini gagal dimuat. Coba lagi, dan kalau masih gagal hubungi admin
        {error.digest ? ` dengan kode ${error.digest}` : ""}.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Coba lagi</Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Ke dashboard
        </Link>
      </div>
    </div>
  );
}
