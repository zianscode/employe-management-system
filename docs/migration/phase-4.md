# Phase 4 Payroll, Dashboard, Laporan, dan CSV

Catatan historis untuk rilis Phase 4. Gunakan checkpoint sebelum cleanup untuk mengulang pembandingan Prisma. Vektor payroll dan regresi Go tersedia di proyek saat ini. [Panduan proyek dan deployment saat ini](phase-5.md)

Go menangani generate dan pembayaran payroll, komponen tetap, slip, dashboard, enam pembacaan laporan, dan enam ekspor CSV. Next.js mempertahankan halaman, filter, dialog, nama file, dan tampilan cetak. Node meneruskan cookie EMS ke Go untuk halaman server dan request browser. Implementasi Prisma legacy tersedia untuk pembanding paritas. [OpenAPI 0.4.0](../../backend/api/openapi.yaml)

| Cakupan | Path dengan awalan `/api/v1` |
| --- | --- |
| Daftar dan slip | `GET /salaries?month=…&year=…` dan `GET /salaries/{id}/slip` |
| Generate dan bayar | `POST /payroll-periods/{year}/{month}/generate`, `POST /payroll-periods/{year}/{month}/mark-paid`, `POST /salaries/{id}/mark-paid` |
| Komponen gaji | `GET/POST /employees/{id}/payroll-components` dan `DELETE /payroll-components/{id}` |
| Dashboard | `GET /dashboard/stats` dan `GET /dashboard/me`, bersama hitungan persetujuan Phase 3 |
| Laporan | `GET /reports/attendance`, `/salary`, `/employees`, `/leave`, `/salary-trend`, dan `/department-distribution` |
| Ekspor | `GET /reports/{attendance,salary,employees,leave}.csv`, `GET /employees.csv`, dan `GET /attendance/daily.csv` |

## Perhitungan dan riwayat

- Overtime memakai jam dari absensi bertanda lembur dikalikan tarif perusahaan. Potongan cuti memakai hari kerja yang masuk periode untuk cuti tanpa tanggungan yang disetujui, dengan akhir pekan dan hari libur dikecualikan. Tunjangan dan potongan tetap disalin ke snapshot slip.
- Iuran BPJS memakai status kepesertaan, upah minimum, batas dasar BPJS Kesehatan dan JP, serta tarif JKK. Tarif TER mengikuti kategori PTKP dan batas inklusif seperti kalkulator legacy. Desember membaca slip sebelumnya di tahun yang sama untuk menghitung PPh 21 setahun, termasuk pengembalian jika potongan sebelumnya berlebih.
- Nilai nominal disimpan dalam rupiah bulat. Urutan operasi dan pembulatan mengikuti JavaScript legacy. Jika hasil di luar kapasitas kolom integer PostgreSQL, transaksi ditolak tanpa menulis hasil sebagian.
- Slip membaca nominal, PPh 21, dan komponen dari snapshot historis. Nama perusahaan, data profil, dan jabatan tetap mengikuti tampilan legacy. Tanggal pembayaran ditampilkan dalam zona Asia/Jakarta dengan timestamp UTC tetap tersimpan.

## Transaksi dan akses

Generate dan kedua jenis pembayaran mengambil advisory lock PostgreSQL per tahun pajak. Dengan begitu, perhitungan Desember, generate periode sebelumnya, dan pembayaran bersamaan punya urutan yang jelas. Generate juga mengunci baris karyawan agar komponen, data absensi, dan cuti yang dipakai dalam satu generate konsisten. Upsert mengubah kolom perhitungan hanya untuk slip belum dibayar. Slip dibayar dilewati, termasuk ID, timestamp, dan snapshot.

Pembayaran hanya menandai slip belum dibayar. Status, timestamp, audit, dan satu event outbox per slip yang berubah disimpan dalam transaksi yang sama. Worker Phase 3 melanjutkan pengiriman email. Mutasi komponen juga menyimpan audit pada transaksi yang sama. [Kunci PostgreSQL](https://www.postgresql.org/docs/18/explicit-locking.html) · [Transaksi GORM](https://gorm.io/docs/transactions.html)

HR dan Super Admin dapat melihat semua slip dan melakukan mutasi penggajian. Role lain dapat melihat slip dan tren mereka sendiri. Laporan absensi, karyawan, serta cuti untuk manajer dibatasi pada dirinya dan bawahan langsung. Laporan gaji dan CSV gaji hanya untuk HR dan Super Admin. Ringkasan organisasi dan distribusi divisi mempertahankan agregat tingkat perusahaan yang sudah tampil pada dashboard manajer.

CSV Go mempertahankan kolom, pemisah titik koma, UTF-8 BOM, dan nama unduhan. Pencarian serta filter direktori dan absensi harian diteruskan ke API. Teks yang dapat ditafsirkan sebagai formula spreadsheet diberi awalan apostrof. Nominal negatif tetap berupa angka. [Paket CSV Go](https://pkg.go.dev/encoding/csv)

## Cutover dan rollback

1. Simpan backup database dan artefak frontend serta backend Phase 3, lalu rehearsal pada salinan terisolasi.
2. Hentikan sementara mutasi payroll ketika mengganti versi. Jalankan `go run ./cmd/migrate up` dari `backend/` untuk menerapkan versi `4`. Migrasi menambah indeks periode di tabel `Salary`. Jadwalkan pembuatan indeks pada jendela rilis agar penulis tabel dapat menunggu.
3. Rilis Go dan Next.js Phase 4. Periksa `/readyz`, daftar payroll, slip historis, dashboard, laporan, dan unduhan CSV. Bila memakai SMTP, periksa status antrean yang sama dengan Phase 3.
4. Untuk rollback, hentikan mutasi payroll, lalu pasang kembali pasangan rilis Phase 3. Pertahankan indeks dan outbox di PostgreSQL. Phase 3 dapat membaca slip dan memproses event yang ditulis Phase 4. Lanjutkan trafik setelah hanya satu versi menangani mutasi.

## Verifikasi

Siapkan dua PostgreSQL disposable di `127.0.0.1` bernama `phase4_test` dan `phase4_legacy`. Jalankan Goose `up` untuk keduanya. Jalankan proses Go dengan `DATABASE_URL` menunjuk `phase4_test`, `HTTP_ADDR=127.0.0.1:56548`, dan `APP_ORIGIN=http://127.0.0.1:56549`. Kosongkan SMTP pada lingkungan uji.

Atur `EMS_PHASE4_TEST_DATABASE_URL` menuju `phase4_test`, `EMS_PHASE4_LEGACY_DATABASE_URL` menuju `phase4_legacy`, dan `EMS_PHASE4_API_URL=http://127.0.0.1:56548` pada shell frontend. Jika origin proses Go berbeda, samakan `EMS_PHASE4_APP_ORIGIN`. Jalankan `npm test`. Suite membaca dan menulis akun serta data sintetis pada dua database yang ditentukan. Unit test tetap berjalan saat variabel integrasi tidak diisi.

- Paritas membandingkan 44 kombinasi skenario dan periode November/Desember, mencakup seluruh status PTKP, batas kategori TER, pembulatan, batas dan upah minimum BPJS, pilihan kepesertaan, lembur, cuti lintas bulan, potongan tetap, rekonsiliasi, dan pengembalian PPh 21. Seluruh 17 kolom nominal memiliki selisih Rp0. Metode PPh dan snapshot komponen juga cocok.
- Uji HTTP memeriksa empat role, permintaan lintas origin, laporan, keenam CSV, historis yang dibayar, pembayaran bersamaan dengan generate, satu event outbox per slip, serta rollback seluruh periode ketika nominal gagal divalidasi.
- `go test -count=1 ./...`, `go vet ./...`, build Go, lint, TypeScript, build produksi Next.js, dan 38 tes Vitest lulus. Smoke test dengan kedua build memeriksa sesi empat role, SSR dashboard, slip siap cetak, payroll, serta header unduhan melalui proxy Next.js.
- Goose berhasil pada PostgreSQL 18 terisolasi dan salinan Phase 3. Jumlah baris dan checksum 14 tabel aplikasi serta metadata Prisma pada salinan cocok dengan baseline. Eksekusi `up` berikutnya menghasilkan nol migrasi. Event pembayaran diuji di outbox dengan SMTP eksternal dinonaktifkan.
