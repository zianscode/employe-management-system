# Phase 3 Absensi, Cuti, Audit, dan Notifikasi

Catatan historis untuk rilis Phase 3. [Panduan proyek dan deployment saat ini](phase-5.md)

Go melayani absensi, koreksi, cuti, saldo tahunan, riwayat aktivitas, dan notifikasi. Halaman, form, tabel, CSV, serta alur persetujuan Next.js memakai format data yang sama melalui REST. Browser memakai proxy satu origin `/api/v1/*`. Server Components membaca Go melalui `EMS_BACKEND_URL` dan cookie sesi EMS.

## Kontrak REST

Semua path berikut memakai awalan `/api/v1`. Respons sukses memberi `success`, `message`, dan `data`. Pengajuan baru memakai `201`. Kesalahan mengembalikan `application/problem+json` dengan kode stabil dan request ID. Mutasi dan pratinjau POST memeriksa `Origin`. Lihat request body, tipe, dan parameter di [OpenAPI 0.3.0](../../backend/api/openapi.yaml).

| Modul | Endpoint |
| --- | --- |
| Absensi | `POST /attendance/check-in`, `POST /attendance/check-out`, `GET /attendance/me/today` |
| Rekap | `GET /attendance/daily?date=YYYY-MM-DD`, `GET /attendance/stats`, `GET /attendance/monthly?month=…&year=…` |
| Koreksi | `GET/POST /attendance-corrections`, `POST /attendance-corrections/{id}/approve`, `/reject`, `/cancel` |
| Cuti | `GET/POST /leave-requests`, `GET /leave-requests/stats`, `GET /leave-requests/me/balance`, `POST /leave-requests/preview`, `GET /leave-requests/employee-options` |
| Keputusan cuti | `POST /leave-requests/{id}/approve`, `/reject`, `/cancel` |
| Aktivitas dan badge | `GET /audit-logs`, `GET /dashboard/pending-approvals` |

## Aturan dan integritas

- Tanggal bisnis, batas hari, waktu absensi, dan tahun saldo memakai `Asia/Jakarta`. Hari absensi dan koreksi tetap disimpan sebagai `DATE`. Tanggal cuti tetap disimpan pada tengah malam UTC sesuai format legacy. GORM memakai UTC untuk timestamp otomatis. Rekap mempertahankan toleransi keterlambatan, urutan status, dan pembulatan jam. Catatan aktual didahulukan untuk rekap. Akhir pekan, libur, serta tanggal masuk membatasi status yang disimpulkan tanpa catatan.
- Hari cuti dihitung inklusif pada Senin–Jumat di luar hari libur. Pengajuan lintas tahun dibebankan ke tahun tanggal mulai. Saldo menampilkan pemakaian yang sudah disetujui; pratinjau dan pengajuan memperhitungkan reservasi `PENDING` dan `MANAGER_APPROVED` juga. Kuota karyawan dan tumpang tindih diperiksa kembali waktu persetujuan akhir.
- Karyawan melihat data sendiri dan manajer juga melihat bawahan langsung. HR dan Super Admin melihat semua data dalam modul ini. Pilihan karyawan untuk pengajuan atas nama orang lain dan riwayat audit dibatasi untuk admin. Go memeriksa otorisasi berdasarkan target, pemilik, dan tahap, termasuk larangan menyetujui sendiri bagi HR dan manajer. Pembatalan pengajuan terbuka hanya untuk pemilik. HR dan Super Admin mempertahankan wewenang keputusan akhir untuk status yang diizinkan.
- Check-in, check-out, pengajuan, dan keputusan mengambil kunci baris karyawan yang sama sebelum memeriksa duplikasi, kuota, dan status. Constraint absensi `(employeeId,date)` dan update bersyarat melengkapi kunci tersebut. Koreksi yang disetujui menyimpan absensi, keputusan, audit, dan outbox pada transaksi yang sama. Keputusan cuti menyimpan status, audit, dan outbox pada transaksi yang sama. Koreksi memakai rentang 30 hari Jakarta dan memvalidasi urutan jam setelah menggabungkan nilai lama dan baru.

## Payroll dan outbox selama transisi

Payroll, komponen gaji, dan sebagian laporan atau agregasi dashboard tetap berjalan di Next.js dengan sesi Go dan tabel PostgreSQL yang sama. Rekap laporan absensi, absensi pribadi pada dashboard, saldo cuti, dan badge persetujuan memakai Go. Penulis audit payroll legacy masih mencatat ke `AuditLog` sehingga aktivitasnya tampil bersama catatan Go.

Pembayaran satu slip atau satu periode menulis event `SALARY_PAID` untuk tiap slip yang benar-benar berpindah status dalam transaksi Prisma yang sama. Worker Go membaca slip yang dibayar dan menyiapkan email. Event pengajuan cuti, keputusan cuti, dan keputusan koreksi juga masuk ke `EMSNotificationOutbox`. Reset password tetap memakai alur identitas tersendiri dan transport SMTP Go yang sama.

Atur `APP_ORIGIN`, `SMTP_EMAIL`, dan `SMTP_PASSWORD` pada proses Go. Jika kredensial SMTP kosong, transaksi aplikasi tetap menyimpan event dan worker menunggu konfigurasi. Worker menggunakan `FOR UPDATE SKIP LOCKED` dan lease singkat untuk klaim antar proses. Kegagalan SMTP dijadwalkan ulang dengan jeda eksponensial sampai lima percobaan. Pengiriman yang sudah diterima SMTP mengosongkan payload dan menyimpan kunci deduplikasi. Pengiriman bersifat at-least-once. Jika proses terhenti sesudah SMTP menerima pesan dan sebelum status tersimpan, percobaan berikutnya memakai `Message-ID` yang sama. Untuk pemantauan, periksa antrean tertunda dan baris dengan `failedAt` pada akses database operator. [Dokumentasi locking PostgreSQL](https://www.postgresql.org/docs/18/sql-select.html)

## Cutover dan rollback

1. Ambil backup PostgreSQL dan simpan artefak rilis Phase 2. Rehearsal menggunakan salinan database dan jalankan `go run ./cmd/migrate status`.
2. Terapkan `go run ./cmd/migrate up` hingga versi `3` sebelum merilis Go dan frontend Phase 3. Versi ini hanya menambah tabel dan indeks outbox.
3. Ganti kedua versi saat jendela cutover agar mutasi absensi dan cuti hanya dilayani satu implementasi. Periksa `/readyz`, sesi, halaman absensi dan cuti, dan keterbacaan payroll serta riwayat aktivitas.
4. Untuk rollback, hentikan trafik mutasi dan simpan status antrean. Koordinasikan penyelesaian outbox yang belum terkirim sebelum mengaktifkan pengiriman email aplikasi lama supaya transisi tidak menggandakan notifikasi. Pasang kembali pasangan frontend dan Go Phase 2. Pertahankan tabel outbox dan semua data. Migrasi versi `3` bersifat forward-only.

## Verifikasi

Gunakan PostgreSQL disposable bernama `phase3_test` pada `127.0.0.1`. Migrasikan dengan Goose dan atur `EMS_PHASE3_TEST_DATABASE_URL` sebelum menjalankan suite Go dan Vitest. Suite REST membuat akun dan transaksi sintetis. Pengiriman diuji dengan fungsi pengirim pengganti.

- `go test -count=1 ./...` dan `go vet ./...` lulus, termasuk pemetaan skema dan regresi Phase 2. Cakupan Phase 3 meliputi kalender Jakarta, izin, data rekap, kuota, persaingan transaksi, audit, serta klaim dan retry notifikasi.
- `npm test` lulus 35 tes, termasuk pembayaran payroll paralel pada PostgreSQL. Lint, pemeriksaan TypeScript, dan build produksi Next.js lulus.
- Smoke test HTTP menjalankan binary Go dan build Next.js. Tes meliputi sesi empat role, halaman absensi dan cuti, dashboard, pengaturan, check-in, check-out, persetujuan cuti, audit, dan penolakan origin lain. Server Actions legacy untuk laporan absensi dan pembayaran slip juga diuji dari build produksi, bersama akses slip dan event outbox.
- Migrasi lulus pada database kosong dan salinan Phase 2. Jumlah baris dan checksum 14 tabel aplikasi beserta metadata Prisma pada salinan cocok dengan baseline. Menjalankan `up` sekali lagi menghasilkan nol migrasi. SMTP Gmail sungguhan tidak digunakan pada pengujian.
