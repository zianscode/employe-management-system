# Phase 2 Identitas dan Data Master HR

Catatan historis untuk rilis Phase 2. [Panduan proyek dan deployment saat ini](phase-5.md)

Frontend memakai REST Go untuk login, logout, sesi, reset dan ganti password, pengelolaan akun, profil, onboarding, karyawan dan riwayatnya, users dan roles, organisasi, pengaturan perusahaan, serta hari libur. Skema OpenAPI berisi operasi yang aktif. DTO REST mempertahankan data yang dipakai komponen Next.js. [Kontrak OpenAPI](../../backend/api/openapi.yaml)

## Transisi dan penyimpanan

- Gunakan satu PostgreSQL untuk kedua proyek. Goose versi `00002` menambahkan tabel `EMSSession`, `EMSRateLimit`, dan indeksnya. Tabel bisnis serta riwayat Prisma dipakai bersama. Jalankan `status` dan `up` pada database yang sudah diadopsi. Untuk database Prisma yang belum diadopsi, lakukan backup dan rehearsal, lalu jalankan `baseline` sekali sebelum `up`.
- Next meneruskan request browser dari origin yang sama ke Go melalui `/api/v1/*`. Server Component dan guard Server Actions legacy meneruskan hanya cookie `ems_session` ke Go. Gunakan `EMS_BACKEND_URL` untuk URL internal dan `APP_ORIGIN` untuk origin publik browser. Pengguna perlu login ulang saat perpindahan dari Auth.js. Tautan reset lama perlu diminta ulang.
- Absensi, cuti, payroll, dashboard, laporan, audit legacy, dan notifikasi tetap berjalan di Next. Pembacaan pengaturan serta hari libur oleh aturan legacy memakai tabel yang sama dengan Go.
- Simpan direktori unggahan lama. Go memvalidasi JPEG, PNG, GIF, dan WebP hingga 4 MB dan menulis foto JPEG tanpa metadata ke `AVATAR_DIR`. Path database tetap `/uploads/avatars/...`. Next melayani berkas yang sudah ada dan meneruskan sisanya ke Go. Gunakan volume persisten dan sertakan keduanya dalam backup jika penyimpanan terpisah.

## Keamanan dan integritas

- Sesi dibatasi 30 hari dengan token acak dan digest SHA-256 di database. Cookie memakai `HttpOnly`, `SameSite=Lax`, dan `Secure` pada HTTPS. Go memeriksa sesi, akun aktif, role, serta tahap ganti password dan onboarding pada request. Mutasi memerlukan `Origin` yang cocok.
- Bcrypt tetap kompatibel dengan hash lama. Kata sandi baru maksimal 72 byte. Login gagal lima kali mengunci akun sekitar 15 menit. Rate limit PostgreSQL menangani percobaan IP, reset per email, dan ganti password. Untuk deployment, proxy tepercaya dapat meneruskan IP dengan membersihkan `X-Forwarded-For` dan mengatur `TRUSTED_PROXY_CIDRS` Go. Proxy Next lokal memakai batas IP bersama.
- Reset memakai digest satu jam, mengonsumsi token sekali, dan mencabut semua sesi. Ganti password biasa mempertahankan sesi saat ini agar alur onboarding dapat berlanjut. Reset admin, perubahan role, dan penonaktifan mencabut sesi target. Pengiriman reset menggunakan SMTP Gmail bila `SMTP_EMAIL` dan `SMTP_PASSWORD` dikonfigurasi di Go. Respons lupa password seragam dan pengiriman dibatasi di latar belakang.
- Validasi JSON dan pembatasan ukuran ditangani server. Error memakai Problem Details dan ID request. Mutasi multi-tabel, pengelolaan role istimewa, serta audit akun dan data master diterapkan bersama dalam transaksi. HR dapat mengelola akun biasa dan hanya Super Admin dapat mengelola akun Super Admin.

## Rollback aplikasi

Simpan artefak Next.js Phase 1 sebelum cutover lingkungan. Bila rollback dibutuhkan, alihkan trafik dan hentikan mutasi Go sebelum mengaktifkan versi tersebut. Pertahankan tabel tambahan Goose dan PostgreSQL yang sama. Pengguna login ulang ke sistem sesi lama. Pastikan direktori avatar Go juga dapat dilayani dari path `/uploads/avatars/` oleh versi rollback. Bila diperlukan, sinkronkan berkas dengan verifikasi hash sebelum mengalihkan trafik.

## Hasil verifikasi

- Build produksi, lint, TypeScript, dan 34 tes Next.js lulus. Smoke test HTTP melalui proxy Next memakai akun dengan hash dari bcryptjs. Empat role lulus login, sesi, akses halaman, serta pembacaan absensi legacy. Pengalihan ganti password dan onboarding, perlindungan origin, serta akses foto lewat path lama juga lulus.
- `go test ./...`, `go vet ./...`, dan `go build ./...` lulus. Integrasi PostgreSQL mencakup reset satu kali pakai dengan pengirim email uji, pencabutan sesi, lockout, cakupan admin, profil, onboarding, role, organisasi, pengaturan perusahaan, hari libur, dan transaksi karyawan. SMTP Gmail aktual perlu divalidasi saat menyiapkan lingkungan deployment.
- Goose diuji pada database kosong dan salinan baseline Prisma yang sudah diadopsi. Pemeriksaan ulang menghasilkan nol migrasi tertunda. Jumlah dan hash baris 14 tabel aplikasi dan riwayat Prisma cocok dengan salinan sebelum upgrade. Database proyek dan berkas avatar asli tidak dipakai untuk pengujian mutasi.
- `govulncheck` menemukan nol kerentanan pada jalur Go yang terjangkau. Tiga temuan modul tanpa jalur panggilan masih tercatat. Manifest dan lockfile npm dipertahankan dari Phase 1.

[Panduan backend](../../backend/README.md) · [Panduan frontend](../../frontend/README.md)
