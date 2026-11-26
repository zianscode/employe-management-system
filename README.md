# Employee Management System

Aplikasi HR untuk mengelola akun dan data karyawan, organisasi, absensi dan koreksi, cuti dan kuota, penggajian dan slip, laporan CSV, audit, serta notifikasi.

## Arsitektur

| Folder | Stack dan tanggung jawab |
| --- | --- |
| `frontend/` | Node.js 24, Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui. Merender halaman, membaca API dari Server Components, dan meneruskan request browser melalui route `/api/v1/*`. |
| `backend/` | Go 1.27.4, Gin, GORM, Goose, PostgreSQL 18, dan REST dengan OpenAPI. Modular monolith per fitur untuk autentikasi, otorisasi, validasi, aturan bisnis, penyimpanan, dan worker notifikasi. |

```text
frontend/
  src/app/                Halaman, layout, dan proxy REST
  src/features/           Komponen dan hook per fitur
  src/lib/api/             Sesi, klien REST, transport, dan tipe OpenAPI
  src/shared/             shadcn/ui, komponen, tipe, dan utilitas bersama
  scripts/                Pemeriksaan sumber runtime dan jejak build
backend/
  cmd/{api,migrate,bootstrap}/  Proses API dan perintah operasional
  internal/modules/      Modul bisnis dan worker notifikasi
  internal/platform/     HTTP, PostgreSQL, migrasi, SMTP, dan kalender kerja
  api/openapi.yaml       Kontrak REST
  migrations/            SQL Goose dan arsip SQL historis di legacy/
```

Browser berkomunikasi dengan Next.js pada satu origin. Proxy Next.js meneruskan cookie `ems_session`, header yang diizinkan, dan body ke Go. Server Components membaca Go melalui alamat internal yang sama. Go menentukan akses berdasarkan sesi, role, dan cakupan data. `MANAGER` bekerja dengan data sendiri dan bawahan langsung sesuai endpoint. `EMPLOYEE` mengakses data sendiri. Akses HR dan admin juga mengikuti aturan per operasi. [Kontrak OpenAPI](backend/api/openapi.yaml)

Tanggal operasional memakai zona `Asia/Jakarta`. Payroll menyimpan nominal dalam rupiah utuh dan mempertahankan slip yang sudah dibayar. [Aturan payroll](backend/internal/modules/payroll/rules.go)

## Jalankan dari awal di Windows

Gunakan Windows PowerShell 5.1 atau PowerShell 7. Pasang Node.js 24 dengan npm, Go 1.27.4, dan PostgreSQL 18 dengan layanan aktif. Pastikan folder `bin` PostgreSQL tersedia di `PATH` atau gunakan path lengkap ke `psql.exe`. Setiap terminal di bawah dimulai dari root repository.

```powershell
node --version
npm.cmd --version
go version
psql --version
```

### 1. Siapkan PostgreSQL lokal

Untuk instalasi baru, buka `psql` menggunakan akun administrator PostgreSQL yang dibuat saat instalasi. Sesuaikan host dan port di semua perintah jika diperlukan.

```powershell
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -W
```

Jalankan di prompt `psql`, lalu pilih password untuk akun aplikasi saat diminta.

```sql
CREATE ROLE ems_dev LOGIN;
\password ems_dev
CREATE DATABASE ems_dev OWNER ems_dev;
\q
```

Jika memakai database EMS yang sudah berisi data, gunakan nama database dan akun yang ada. Untuk latihan migrasi, gunakan salinan yang dipulihkan dari backup. [Referensi psql](https://www.postgresql.org/docs/18/app-psql.html)

### 2. Terminal A · Konfigurasi dan jalankan Go

```powershell
Set-Location backend
go mod download

$pgSecurePassword = Read-Host 'Password PostgreSQL ems_dev' -AsSecureString
$pgPassword = [System.Net.NetworkCredential]::new('', $pgSecurePassword).Password
$pgPasswordEncoded = [Uri]::EscapeDataString($pgPassword)
$env:DATABASE_URL = "postgresql://ems_dev:${pgPasswordEncoded}@127.0.0.1:5432/ems_dev"
Remove-Variable pgSecurePassword, pgPassword, pgPasswordEncoded
$env:HTTP_ADDR = '127.0.0.1:8080'
$env:APP_ORIGIN = 'http://127.0.0.1:3000'
$env:AVATAR_DIR = Join-Path (Get-Location) 'uploads/avatars'
```

Backend membaca variabel proses. [`backend/.env.example`](backend/.env.example) berisi referensi nama dan format. Set kedua variabel `SMTP_EMAIL` dan `SMTP_PASSWORD` untuk reset password dan pengiriman email notifikasi. Biarkan `TRUSTED_PROXY_CIDRS` kosong pada setup loopback ini.

Pilih alur migrasi berdasarkan keadaan database.

| Keadaan PostgreSQL | Perintah dari `backend/` |
| --- | --- |
| Database kosong baru | `go run ./cmd/migrate up`, lalu `go run ./cmd/migrate status`. Versi 1–4 akan terdaftar sebagai `applied`. |
| Database sudah dikelola Goose | `go run ./cmd/migrate status`, lalu `go run ./cmd/migrate up` untuk versi yang tertunda. |
| Database lama dengan ledger Prisma | Cadangkan PostgreSQL dan avatar. Uji `go run ./cmd/migrate baseline` pada salinan terisolasi sebelum mengadopsi database sasaran. Setelah adopsi berhasil, jalankan `go run ./cmd/migrate up`. [Panduan migrasi backend](backend/README.md#migrasi-database) |

Untuk database baru yang tabel pengguna dan karyawannya masih kosong, buat akun `SUPER_ADMIN` sekali. Password sementara mengikuti kebijakan minimal 8 karakter dengan huruf dan angka. Login pertama mewajibkan ganti password dan onboarding. Database dengan akun yang sudah ada memakai kredensial sebelumnya.

```powershell
$adminSecurePassword = Read-Host 'Password sementara admin EMS' -AsSecureString
$env:BOOTSTRAP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecurePassword).Password
Remove-Variable adminSecurePassword
try {
  go run ./cmd/bootstrap -email 'admin@example.com' -name 'Admin EMS'
} finally {
  Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
}
```

Setelah migrasi dan bootstrap berhasil, biarkan proses ini berjalan di Terminal A.

```powershell
go run ./cmd/api
```

### 3. Terminal B · Konfigurasi dan jalankan Next.js

```powershell
Set-Location frontend
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.example -Destination .env.local
}
npm.cmd ci
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Pastikan `frontend/.env.local` berisi `EMS_BACKEND_URL="http://127.0.0.1:8080"`. Variabel proses dengan nama yang sama memiliki prioritas. Gunakan `npm` sebagai pengganti `npm.cmd` pada shell yang menyediakannya. [Urutan pemuatan environment Next.js](https://nextjs.org/docs/15/app/guides/environment-variables)

Dengan kedua terminal aktif, buka [http://127.0.0.1:3000](http://127.0.0.1:3000) dan login. Browser harus memakai origin yang sama persis dengan `APP_ORIGIN`, termasuk host dan port. Tekan Ctrl+C pada masing-masing terminal untuk menghentikan kedua proses.

### 4. Cek koneksi lokal

Jalankan dari terminal ketiga sementara kedua server aktif.

```powershell
Invoke-RestMethod http://127.0.0.1:8080/healthz
Invoke-RestMethod http://127.0.0.1:8080/readyz
(Invoke-WebRequest http://127.0.0.1:3000/login).StatusCode
```

- `503` pada readiness berarti PostgreSQL belum bisa diakses atau versi skema yang diperlukan belum diterapkan. Periksa `DATABASE_URL` pada Terminal A dan jalankan `go run ./cmd/migrate status`.
- `502 BACKEND_UNAVAILABLE` pada Next.js perlu pengecekan `EMS_BACKEND_URL` dan proses Go. Mulai ulang Next.js setelah memperbarui environment.
- `403` saat login atau mutasi dapat muncul jika origin browser berbeda dari `APP_ORIGIN`. Gunakan host dan port yang sama sebelum menelusuri izin role.

## Pengujian dan build produksi

| Folder | Perintah |
| --- | --- |
| `frontend/` | `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run typecheck`, lalu `npm.cmd run check:runtime -- --build`. Build membuat tipe Next.js dan manifest yang dipakai pemeriksaan berikutnya. Build standar memakai font yang diambil dari Google Fonts. |
| `backend/` | `go test -count=1 ./...`, `go vet ./...`, `go build ./...`. Siapkan database disposable dan variabel tes untuk mengaktifkan suite integrasi PostgreSQL. |

Untuk menjalankan build produksi secara lokal, gunakan environment Terminal A yang sama.

```powershell
$emsApi = Join-Path $env:TEMP 'ems-api.exe'
go build -o $emsApi ./cmd/api
if ($LASTEXITCODE -eq 0) { & $emsApi }
```

Di Terminal B jalankan `npm.cmd run build`, lalu `npm.cmd start -- --hostname 127.0.0.1 --port 3000`. [Frontend](frontend/README.md) · [Backend dan setup database tes](backend/README.md)

## Deployment dan rollback

Gunakan TLS pada ingress, koneksi privat ke Go dan PostgreSQL, serta volume privat persisten untuk `AVATAR_DIR`. Samakan `APP_ORIGIN` dengan origin HTTPS browser dan atur `EMS_BACKEND_URL` pada proses Next.js. Jalankan migrasi secara terpisah dengan role migrasi. Role aplikasi perlu akses baca ke `goose_db_version` untuk readiness.

1. Sebelum deployment, simpan artefak rilis sebelumnya, cadangkan PostgreSQL dengan `pg_dump -Fc`, dan salin volume avatar. Uji pemulihan pada database terisolasi dan cocokkan data serta hash avatar.
2. Hentikan sementara operasi tulis saat pergantian versi. Periksa status Goose, terapkan migrasi yang diperlukan, lalu periksa `/readyz` pada Go. Uji login, akses slip historis, avatar, dan CSV lewat Next.js sebelum membuka trafik. Verifikasi SMTP jika reset password dan notifikasi email diaktifkan.
3. Jika perlu rollback, hentikan operasi tulis dan kembalikan artefak aplikasi yang kompatibel dengan skema aktif. Gunakan database dan volume yang sama, lalu ulangi pemeriksaan sebelum membuka trafik.

## Batas fitur

THR dan bonus, karyawan harian, pajak karyawan yang berhenti di tengah tahun, serta perlakuan PPh 21 DTP belum tercakup.
