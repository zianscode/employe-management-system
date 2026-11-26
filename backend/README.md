# Backend Employee Management System

Go 1.27.4, Gin, GORM, Goose, dan PostgreSQL. `internal/modules` mencakup identitas, karyawan, organisasi, pengaturan, absensi, cuti, payroll, dashboard, laporan, audit, dan worker notifikasi. `internal/platform` menangani HTTP, CSV, kalender kerja Jakarta, SMTP, koneksi PostgreSQL, dan migrasi. `api/openapi.yaml` mendefinisikan endpoint REST.

Jalankan dari `backend/`. Atur variabel proses berdasarkan `.env.example` dan gunakan [setup dari awal](../README.md#jalankan-dari-awal-di-windows) untuk membuat database dan akun lokal.

```powershell
$env:DATABASE_URL = 'postgresql://ems:replace-me@127.0.0.1:5432/employee_management'
$env:HTTP_ADDR = '127.0.0.1:8080'
$env:APP_ORIGIN = 'http://127.0.0.1:3000'
go mod download
go run ./cmd/migrate up
go run ./cmd/migrate status
go run ./cmd/api
```

| Endpoint | Hasil |
| --- | --- |
| `GET /healthz` | Status proses HTTP. |
| `GET /readyz` | `200` bila PostgreSQL merespons dan migrasi Goose yang diperlukan sudah diterapkan. `503` bila database tidak tersedia atau migrasi tertunda. |
| `GET /openapi.yaml` | Kontrak yang disertakan pada binary. |

## Migrasi database

Pilih satu pemilik migrasi per database. Jalankan perintah dari `backend/` dengan `DATABASE_URL` eksplisit. Server API tidak menjalankan migrasi saat startup. Gunakan role migrasi terpisah dari role aplikasi pada lingkungan produksi.

- **Database kosong** dapat dibuat dengan `go run ./cmd/migrate up`. Goose membangun skema aplikasi dari baseline enam migrasi Prisma dan menerapkan perubahan aditif. Riwayat untuk database baru ini dikelola Goose.
- **Database Prisma yang belum diadopsi** memerlukan `go run ./cmd/migrate baseline` sekali sebelum `up`. Cadangkan database dan avatar. Perintah memeriksa enam migrasi Prisma yang selesai dan sidik jari katalog PostgreSQL. Jika cocok, transaksi mencatat versi `0` dan `1` pada tabel metadata Goose. Gunakan salinan terisolasi untuk rehearsal. Pada database yang sudah diadopsi, jalankan `up` untuk menerapkan migrasi yang tertunda. Phase 3 menambahkan `EMSNotificationOutbox` pada versi `3`.
- **Status** dapat diperiksa dengan `go run ./cmd/migrate status`. Baseline SQL bersifat forward-only. Gunakan artefak aplikasi sebelumnya dengan skema kompatibel untuk rollback.

## Build dan tes

```powershell
go build ./...
go vet ./...
go test -count=1 ./...
```

Suite berikut dilewati bila variabel DSN terkait kosong. Buat tiga database disposable dengan nama pada tabel, menggunakan akun uji PostgreSQL. Arahkan `DATABASE_URL` secara bergantian ke masing-masing database dan jalankan `go run ./cmd/migrate up` sampai versi 4. Atur variabel berikut sebelum `go test -count=1 ./...`. Ketiga suite REST mensyaratkan host `127.0.0.1` dan menulis fixture sintetis. Tes reset memakai pengirim email uji.

| Variabel | Database | Cakupan |
| --- | --- | --- |
| `EMS_PHASE2_TEST_DATABASE_URL` | `phase2_test` | Sesi, login, reset, onboarding, otorisasi, dan data HR |
| `EMS_PHASE3_TEST_DATABASE_URL` | `phase3_test` | Absensi dan koreksi, cuti dan kuota, audit, dan outbox |
| `EMS_PAYROLL_TEST_DATABASE_URL` | `phase5_rest` | REST payroll, dashboard, laporan, CSV, slip historis, dan outbox |
| `EMS_GOOSE_TEST_DATABASE_URL` | Database uji yang sudah dimigrasikan, misalnya `phase5_rest` | Pemetaan 14 model melalui pembacaan metadata skema |

Migrasi versi `4` menambahkan indeks periode `Salary_period_idx`. Enam migrasi SQL sebelum Goose dan metadata dialek disimpan di `migrations/legacy/` untuk riwayat dan restore. [Arsip SQL](migrations/legacy/README.md)

Suite Go juga memeriksa 43 vektor payroll dengan nilai referensi dari kalkulator lama, termasuk nominal, metode PPh 21, dan snapshot tunjangan serta potongan. Worker email berjalan jika `SMTP_EMAIL` dan `SMTP_PASSWORD` dikonfigurasi.

## Admin pertama

Setelah `go run ./cmd/migrate up` pada database baru, jalankan perintah berikut dari `backend/`.

```powershell
$adminSecurePassword = Read-Host 'Password sementara' -AsSecureString
$env:BOOTSTRAP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecurePassword).Password
Remove-Variable adminSecurePassword
try {
  go run ./cmd/bootstrap -email 'admin@example.com' -name 'Admin EMS'
} finally {
  Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
}
```

Bootstrap membutuhkan tabel pengguna dan karyawan kosong. Administrator berperan `SUPER_ADMIN`, wajib mengganti password sementara, dan menyelesaikan onboarding. Database dengan akun yang sudah ada memakai kredensial sebelumnya.

[Deployment, backup, dan rollback](../README.md#deployment-dan-rollback)
