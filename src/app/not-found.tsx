import Link from "next/link";
import { buttonClass } from "@/shared/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-brand">404</p>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Alamat yang Anda buka tidak ada, atau datanya sudah dihapus.
      </p>
      <Link href="/dashboard" className={buttonClass("primary", "md", "mt-6")}>
        Kembali ke dashboard
      </Link>
    </div>
  );
}
