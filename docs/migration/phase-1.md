# Phase 1 Fondasi Backend Go

Catatan historis untuk rilis Phase 1. [Panduan proyek dan deployment saat ini](phase-5.md)

Next.js berada di `frontend/` dan Go berada di `backend/`, dengan manifest, lockfile, konfigurasi, dan proses build masing-masing. Prisma dan Auth.js tetap melayani fitur frontend sampai cutover tahap berikutnya. Backend Go memiliki endpoint liveness, readiness, dan OpenAPI. Klien probe TypeScript memakai tipe yang dihasilkan dari kontrak tersebut.

## Kompatibilitas data dan rollback

- Pindahan frontend mencakup konfigurasi lokal, direktori `public/uploads`, Prisma, dan perubahan UI sebelumnya. Dari 264 berkas sebelum pemindahan, semua hash cocok sesudah pemindahan.
- SQL Goose berasal dari skema PostgreSQL terisolasi setelah keenam migrasi Prisma diterapkan. SQL berisi DDL final tanpa data atau riwayat Prisma. Mapping GORM memakai nama tabel dan kolom lama secara eksplisit. Foreign key, constraint, indeks, dan default dikelola SQL. Pembuatan UUID/CUID dan aturan `updatedAt` untuk mutasi Go diselesaikan bersama modul bisnis yang akan menulis data.
- Adopsi membandingkan nama dan status enam migrasi Prisma dan sidik jari tabel, kolom, tipe, nullability, default, constraint, indeks, serta enum. Percobaan pada target tidak cocok ditolak. `up` menolak menjalankan DDL baseline di database Prisma yang belum diadopsi. API memerlukan koneksi PostgreSQL untuk readiness, sementara proses HTTP tetap dapat melaporkan liveness.
- Gunakan backup dari lingkungan sasaran untuk rehearsal Phase 5. Pulihkan ke database terpisah dan cocokkan data, relasi, serta berkas avatar sebelum mengalihkan trafik. Saat rollback Phase 1, aplikasi Next.js dapat memakai skema yang sama dan riwayat Prisma tetap tersedia pada database legacy.

## Tinjauan dependensi

`npm audit --omit=dev` melaporkan **0 kritis, 8 tinggi, dan 1 sedang**. Manifest dan lockfile frontend dari Phase 0 dipertahankan selama pemisahan proyek.

| Jalur | Penilaian Phase 1 |
| --- | --- |
| `@prisma/config` → `effect`, `deepmerge-ts` | Jalur konfigurasi CLI Prisma. Tinjau patch kompatibel bersama paket Prisma dan uji ulang `generate`, `migrate deploy`, serta `migrate diff`. |
| `next` → `postcss` → `nanoid`, `source-map-js` | Jalur build CSS. npm menyarankan upgrade Next.js ke major baru untuk rantai ini. Jadwalkan terpisah dengan verifikasi build dan tampilan. |
| `nodemailer`, `zod` | Dipakai pada alur email dan validasi input. Prioritaskan penilaian jangkauan dan uji regresi bila mengadopsi upgrade major yang disarankan npm. |

Advisori yang tersisa perlu ditinjau sebelum deployment publik. Pembaruan major dan override rantai dependensi memerlukan verifikasi tersendiri.

Untuk backend baru, `govulncheck` awal menandai lima temuan pada `golang.org/x/net` dan `github.com/quic-go/quic-go`. Keduanya diperbarui ke `v0.60.0` dan `v0.59.1`. Pemindaian ulang melaporkan nol kerentanan pada jalur kode yang terjangkau. Tiga temuan masih tercatat pada modul yang disyaratkan tanpa jalur panggilan yang ditemukan. Jalankan ulang pemindaian saat modul bisnis ditambahkan.

## Hasil verifikasi

- Frontend lulus lint, pemeriksaan tipe dalam build produksi, 34 tes, dan smoke test HTTP login serta akses empat role. Build masih menampilkan peringatan kompatibilitas `jose` dengan Edge Runtime.
- Backend lulus `go test ./...`, `go vet ./...`, build API dan migrator, serta pemeriksaan 14 mapping GORM terhadap PostgreSQL 18. Probe langsung memverifikasi respons `200` dan `503`, dokumentasi OpenAPI, dan klien TypeScript.
- Bootstrap Goose pada database kosong menghasilkan skema yang sama dengan Prisma, dengan `goose_db_version` sebagai satu-satunya selisih. Adopsi pada hasil restore mempertahankan jumlah dan hash baris di 14 tabel aplikasi serta seluruh riwayat Prisma. Kedua jalur dijalankan ulang untuk menguji idempotensi. Database dengan schema drift ditolak sebelum ledger dibuat.
- Cadangan PostgreSQL dipulihkan ke database terisolasi. Berkas avatar fixture lulus pemeriksaan hash setelah pemulihan. Database proyek dan unggahan asli berada di luar pengujian pemulihan ini.

[Panduan frontend](../../frontend/README.md) · [Panduan backend](../../backend/README.md) · [Pemetaan operasi bisnis Phase 0](phase-0.md)
