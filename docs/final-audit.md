# Audit akhir Employee Management System

Audit 26 November 2026 memakai Windows, Node.js 24.17.0, Go 1.27.4, dan PostgreSQL 18.4 terisolasi. Setup lokal dan alur bisnis inti terverifikasi pada data sintetis. Audit npm produksi bersih setelah patch PostCSS. Persiapan rilis publik masih memerlukan verifikasi ingress, SMTP, dan pemulihan data di lingkungan sasaran.

## Struktur, dependensi, dan integrasi

- Frontend dan backend memiliki manifest, lockfile, build, dan konfigurasi masing-masing. Next.js mengurus rendering dan proxy satu origin. Gin mendaftarkan rute REST dan middleware untuk sesi, status akun, dan role. Cakupan objek diperiksa di Go. Batas modul mengikuti fitur. Fungsi domain yang membutuhkan database memakai GORM, sementara helper platform menangani kebutuhan lintas fitur.
- Kontrak OpenAPI memiliki 81 operasi bisnis. Tes membandingkan method dan path dengan router terdaftar. Tes integrasi memeriksa status, bentuk respons, dan aturan bisnis pada operasi yang diuji. Tipe TypeScript dari OpenAPI disimpan di frontend. [Kontrak API](../backend/api/openapi.yaml) · [Tes kontrak](../backend/internal/platform/httpapi/contract_test.go)
- Build menelusuri 178 berkas runtime dan 26 jejak produksi. Terdaftar 0 Server Actions dan 0 dependensi runtime Prisma, NextAuth, driver PostgreSQL, serta Nodemailer. Skrip diagnosis Prisma tanpa pemanggil, argumen sesi yang sudah diabaikan, helper SSR tanpa pemanggil, dan allowlist optimisasi gambar eksternal yang tidak dipakai telah dibersihkan. Arsip SQL lama tetap tersedia untuk riwayat dan restore. [Arsip migrasi](../backend/migrations/legacy/README.md)
- ESLint, TypeScript dengan pemeriksaan lokal/parameter tambahan, dan `gofmt` lulus. Impor Radix berada di wrapper shadcn/ui. `react-is` memenuhi peer dependency Recharts. `npm ls --depth=0` dan `go mod verify` lulus, dan `go mod tidy -diff` kosong. `@types/node` masih mengikuti Node 20 pada runtime Node 24. Selaraskan saat pembaruan tooling berikutnya. [Manifest frontend](../frontend/package.json) · [Modul Go](../backend/go.mod)

## Keamanan

Kontrol yang diverifikasi meliputi token sesi acak dengan digest di PostgreSQL, cookie HttpOnly dan SameSite=Lax dengan Secure pada HTTPS, pengecekan Origin mutasi, pencabutan sesi, lockout login, reset berbatas waktu, dan otorisasi berdasarkan role, pemilik, atau atasan langsung sesuai fitur. Go membatasi payload JSON dan memakai respons error dengan request ID. Alur payroll dan persetujuan terkait mencatat audit serta outbox secara transaksional. Tes memeriksa penolakan akses dan unduhan privat. Ekspor CSV menetralkan sel teks yang dapat terbaca sebagai formula. [Rute dan middleware Go](../backend/internal/platform/httpapi/business.go) · [Proxy REST Next.js](../frontend/src/app/api/v1/%5B...path%5D/route.ts)

| Area | Temuan terverifikasi | Tindak lanjut |
| --- | --- | --- |
| npm produksi | 0 temuan. Override hanya untuk Next.js 15.5.29 memakai PostCSS 8.5.33, versi stabil yang sudah dipakai Tailwind di lockfile. Temuan PostCSS tinggi dan temuan Next.js turunannya selesai | Tinjau override ketika berpindah ke rilis Next.js yang sudah membawa PostCSS versi aman. |
| npm seluruh lockfile | 6 sedang dari rantai TypeScript ESLint dan minimatch untuk development, 0 tinggi, 0 kritis | Perbarui tooling dalam perubahan terpisah, lalu ulangi lint dan build. |
| Go | `govulncheck -show verbose ./...` melaporkan 0 simbol rentan yang terjangkau. Ada 3 advisori di modul `x/net` dan `x/crypto`, pada jalur HTML dan OpenPGP di luar pemanggilan aplikasi | Tinjau versi patch kompatibel, lalu ulangi `govulncheck` dan pengujian Go. |
| Ingress dan email | Proxy Next meneruskan header dalam allowlist tanpa IP pengunjung. Pembatas berbasis IP di Go melihat alamat proxy pada topologi bawaan, sehingga beberapa pengguna dapat berbagi satu kuota. Pembatas berbasis akun tetap berjalan. HTTPS publik dan SMTP nyata belum diuji | Verifikasi pembatasan ingress berdasarkan IP tepercaya, header keamanan deployment, cookie HTTPS, akses privat ke Go/PostgreSQL, dan pengiriman reset serta notifikasi melalui SMTP sasaran. |

Advisori npm yang diperiksa. [PostCSS qx2v](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) · [PostCSS 6g55](https://github.com/advisories/GHSA-6g55-p6wh-862q) · [PostCSS fxqj](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) · [PostCSS r28c](https://github.com/advisories/GHSA-r28c-9q8g-f849) · [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)

Advisori Go dari hasil scan. [GO-2026-6866](https://pkg.go.dev/vuln/GO-2026-6866) · [GO-2026-6860](https://pkg.go.dev/vuln/GO-2026-6860) · [GO-2026-5932](https://pkg.go.dev/vuln/GO-2026-5932)

## Verifikasi setelah cleanup

| Pemeriksaan | Hasil |
| --- | --- |
| Frontend | `npm ci`, 9 tes Node, lint, TypeScript, build produksi, dan pemeriksaan jejak build lulus. Coverage Node 84,93% baris pada empat berkas yang dimuat suite, meliputi transport REST, helper sesi, tanggal Jakarta, dan aturan password. |
| Backend | `go test -count=1` dengan empat DSN uji, `go vet`, dan `go build ./...` lulus. Coverage gabungan 64,4% statement pada package Go yang terinstrumentasi dengan `-coverpkg=./...`. |
| REST dan data | Suite mencakup identitas, akses lintas role, absensi/koreksi, cuti/kuota, payroll, laporan, CSV, audit, serta outbox. Pemetaan 14 model dan 43 vektor nominal payroll dari fixture paritas lulus. |
| Database kosong | Role PostgreSQL lokal non-superuser berhasil membuat skema sampai Goose 4, lalu bootstrap membuat admin awal. Menjalankan `up` lagi menghasilkan 0 migrasi. |
| Smoke test produksi | Go dan Next.js berjalan bersamaan. `/healthz`, `/readyz`, dan `/openapi.yaml` merespons 200. Smoke HTTP melewati login, pergantian password, onboarding, dashboard empat role, avatar privat, absensi/koreksi, cuti, payroll, audit, dan CSV. Satu slip dibayar menghasilkan tepat satu event outbox. Next.js diuji tanpa koneksi PostgreSQL yang dapat dipakai. |
| Regresi UI setelah patch | Dua aset CSS produksi identik secara SHA-256 dengan build sebelumnya. Chrome headless lulus pada layout login seluler, toggle password, login, dashboard, dan navigasi ke laporan. |

Smoke test HTTP dan Chrome mencakup skenario di atas. Pengujian visual otomatis lintas browser belum tersedia. Pemeriksaan lokal juga belum otomatis dipanggil oleh pipeline CI yang tersimpan di repository ini. Rehearsal rollback dan perbandingan data Phase 5 tetap tersedia sebagai bukti historis. Ulangi restore dan smoke test pada backup lingkungan sasaran sebelum cutover publik. [Runbook cutover dan rollback](migration/phase-5.md#runbook-cutover-dan-rollback)

Audit memakai working tree lokal. Pemisahan `frontend/` dan `backend/` belum tercakup di commit aktif. Sertakan kedua folder, konfigurasi contoh, dokumentasi, dan lockfile pada commit rilis yang ditinjau sebelum membangun artefak dari Git. Pemeriksaan kandidat commit meninjau file env, upload privat, artefak build, backup PostgreSQL, dan pola kredensial umum. File environment lokal tetap diabaikan Git. Konfigurasi aktif Next.js memakai `EMS_BACKEND_URL`. PostgreSQL dan SMTP diatur di proses Go. [Aturan ignore](../.gitignore) · [Setup lokal](../README.md#jalankan-dari-awal-di-windows)

## Performa

- Build produksi melaporkan 103 kB First Load JS bersama, 344 kB untuk dashboard, dan 250 kB untuk laporan. SSR dashboard admin pada loopback mencatat p50 90,6 ms dan p95 171,2 ms dari 20 request berurutan setelah tiga pemanasan. Pengukuran mencakup respons HTML pada fixture sintetis. Pengukuran browser di perangkat pengguna dan kapasitas pada volume produksi belum tersedia.
- PostgreSQL memakai pool, dan Goose versi 4 memberi indeks periode gaji. Daftar karyawan masih membaca seluruh hasil yang sesuai cakupan, laporan tren absensi menghitung enam bulan, dan endpoint generate payroll mengunci baris karyawan aktif dalam transaksi. Ukur volume representatif dan durasi transaksi sebelum memutuskan kebutuhan paginasi atau optimisasi query. Batas tulis Go 10 detik dan timeout proxy Next.js 12 detik menjadi acuan saat pengukuran. [Daftar karyawan](../backend/internal/modules/employees/http.go) · [Laporan](../backend/internal/modules/reports/service.go) · [Generate payroll](../backend/internal/modules/payroll/generate.go)
- Benchmark lokal Phase 5 pada 25 karyawan sintetis mencatat p50/p95 sebesar 260,0/326,8 ms pada service Prisma lama dan 17,5/37,9 ms pada Go REST loopback. Jalur pengukurannya berbeda dan baseline berasal dari rehearsal sebelumnya. [Metode benchmark](migration/phase-5.md#verifikasi)
