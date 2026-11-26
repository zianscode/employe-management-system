# Panduan kontribusi Employee Management System

## Batas masing-masing proyek

- Jalankan perintah Node dari `frontend/` dan perintah Go dari `backend/`. Ikuti [README](README.md) untuk setup lokal dan [runbook](docs/migration/phase-5.md) untuk deployment dan rollback.
- Tempatkan halaman, layout, dan handler proxy di `frontend/src/app/`, UI dan hook per fitur di `frontend/src/features/`, serta komponen dan utilitas lintas fitur di `frontend/src/shared/`. Gunakan primitive shadcn/ui yang sudah disediakan di `shared/components/ui/`. Ikuti penamaan `PascalCase.tsx` untuk komponen dan `use-*.ts` untuk hook. Gunakan alias `@/` untuk impor lintas folder dan pola impor lokal di sekitarnya.
- Gunakan klien REST di `frontend/src/lib/api/`. Gunakan transport browser untuk request satu origin dan transport server untuk Server Components. Gunakan cookie `ems_session` melalui jalur yang sudah ada. Simpan `EMS_BACKEND_URL` pada environment server Next.js. Backend Go memiliki koneksi database, SMTP, dan otorisasi bisnis.
- Tambahkan operasi Go pada modul yang memiliki fitur di `backend/internal/modules/` dan daftarkan route serta middleware di `backend/internal/platform/httpapi/`. Lanjutkan pola handler, fungsi domain, dan query GORM yang sudah ada. Tambahkan abstraksi ketika ada kebutuhan nyata. Jalankan `gofmt` pada berkas Go yang diubah.
- Untuk perubahan kontrak, perbarui `backend/api/openapi.yaml`, tes route Go, dan tipe frontend jika terdampak. Tipe `frontend/src/lib/api/schema.ts` dihasilkan dari kontrak. [Perintah regenerasi](frontend/README.md)

## Data dan keamanan

- Pertahankan ID, riwayat, migrasi yang sudah diterapkan, dan slip gaji yang sudah dibayar. Pakai SQL Goose baru untuk perubahan skema. Arsip `backend/migrations/legacy/` menyimpan riwayat sebelum Goose. Gunakan `cmd/migrate` untuk operasi database dan uji adopsi pada salinan terisolasi.
- Terapkan validasi dan otorisasi berdasarkan role serta cakupan objek di Go. Gunakan helper respons HTTP dan pola transaksi yang ada untuk mutasi, audit log, dan outbox. Pertahankan zona `Asia/Jakarta` untuk hari kerja dan rupiah utuh pada payroll.
- Pakai DSN PostgreSQL disposable untuk integrasi. Simpan password, DSN, kredensial SMTP, dan avatar privat di luar sumber version control. Pertahankan lockfile frontend dan `go.mod` serta `go.sum` sebagai sumber versi yang dapat direproduksi.

## Verifikasi

- Frontend memakai `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run typecheck`, dan `npm.cmd run check:runtime -- --build` dari `frontend/`. Gunakan `npm` pada shell yang mendukungnya.
- Backend memakai `go test -count=1 ./...`, `go vet ./...`, dan `go build ./...` dari `backend/`. Jalankan suite PostgreSQL ketika menyentuh aturan bisnis, otorisasi, kontrak, atau skema terkait. [Variabel integrasi](backend/README.md#build-dan-tes)
- Dokumentasikan perubahan perilaku atau konfigurasi dan catat verifikasi yang masih perlu dijalankan. [Baseline audit](docs/final-audit.md)
