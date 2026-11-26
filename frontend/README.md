# Frontend Employee Management System

Next.js, React, TypeScript, Tailwind CSS, dan shadcn/ui. Alur UI, termasuk payroll, dashboard, laporan, dan unduhan CSV, memakai REST Go dengan sesi yang sama. Siapkan PostgreSQL, migrasi, dan backend lewat [panduan setup lokal](../README.md#jalankan-dari-awal-di-windows), lalu jalankan perintah berikut dari `frontend/` dengan Node.js 24.

```powershell
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.example -Destination .env.local
}
npm.cmd ci
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Atur `EMS_BACKEND_URL` ke origin HTTP(S) internal milik API Go. Buka `http://127.0.0.1:3000` dan samakan `APP_ORIGIN` pada Go dengan alamat yang dibuka browser. Browser mengakses `/api/v1/*` melalui Next.js. Server Components memakai API internal. Path `/uploads/avatars/*` diarahkan ke API yang memeriksa sesi.

`EMS_BACKEND_URL` adalah satu-satunya konfigurasi aplikasi frontend. PostgreSQL, SMTP, bootstrap administrator, dan migrasi diatur pada backend.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run typecheck
npm.cmd run check:runtime -- --build
```

Tipe kontrak Go disimpan di `src/lib/api/schema.ts`. Untuk menyegarkan tipe setelah kontrak berubah, gunakan checkout yang berisi kedua proyek dan jalankan perintah berikut dari `frontend/`. Build Next.js memakai tipe yang sudah dihasilkan.

```powershell
npm.cmd exec --yes --package openapi-typescript@7.13.0 --package typescript@5.9.3 -- openapi-typescript ../backend/api/openapi.yaml -o src/lib/api/schema.ts
```

Gunakan `npm` sebagai pengganti `npm.cmd` di shell yang menyediakannya. [Deployment dan rollback](../README.md#deployment-dan-rollback)
