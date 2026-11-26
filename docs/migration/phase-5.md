# Phase 5 Audit, Cutover, dan Rollback

Phase 5 menyelesaikan migrasi dan cleanup legacy setelah checkpoint, verifikasi backup, dan persetujuan penghapusan. Verifikasi memakai PostgreSQL 18 terisolasi. Rilis publik memerlukan rehearsal pada backup lingkungan sasaran, verifikasi SMTP dan ingress, serta tinjauan keamanan pada versi yang akan dirilis. [Hasil audit dependensi terbaru](../final-audit.md#keamanan)

## Arsitektur dan struktur

Browser memakai Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, dan shadcn/ui. Next.js merender UI dan meneruskan cookie sesi EMS ke API Go. Server Components membaca API yang sama melalui jaringan internal. Go 1.27.4 dengan Gin dan GORM menjalankan modular monolith per fitur. Goose mengelola PostgreSQL dan OpenAPI mendokumentasikan REST. Worker Go memakai outbox PostgreSQL untuk pengiriman email. [Kontrak OpenAPI](../../backend/api/openapi.yaml)

| Lokasi | Tanggung jawab |
| --- | --- |
| `frontend/src/app` dan `features` | Halaman, komponen, hooks, dan proxy satu origin |
| `frontend/src/lib/api` dan `shared` | Klien REST, sesi, tipe OpenAPI, dan komponen bersama |
| `backend/cmd` | Entrypoint API, migrasi, dan bootstrap admin |
| `backend/internal/modules` | Identitas, HR, absensi, cuti, payroll, dashboard, laporan, audit, dan notifikasi |
| `backend/internal/platform` | HTTP, koneksi database, migrasi, kalender, CSV, dan SMTP |
| `backend/migrations` | Baseline serta migrasi aditif Goose 1–4 |

Audit menelusuri login, perubahan password, onboarding, profil, karyawan dan riwayatnya, keamanan akun, data master, pengaturan, absensi dan koreksi, cuti dan kuota, payroll dan slip, dashboard, laporan, CSV, audit, serta notifikasi. Alur bisnis memakai REST Go atau worker. OpenAPI mendokumentasikan 81 operasi di bawah `/api/v1`. Tes Go mencocokkan route terdaftar dengan kontrak tersebut. `npm run check:runtime -- --build` memeriksa pohon impor dan jejak produksi Next.js untuk Server Actions dan dependensi backend. Frontend memerlukan `EMS_BACKEND_URL` saat runtime.

## Instalasi dan deployment

Siapkan Node.js 24, Go 1.27.4, dan PostgreSQL 18. Untuk database baru, jalankan Goose `up` dan perintah bootstrap sekali. Pada database Prisma yang belum punya ledger Goose, buat backup dan verifikasi baseline dengan perintah `baseline` sebelum `up`. Pada database yang telah diadopsi, jalankan `status` lalu `up`. Phase 5 memakai skema Goose versi 4. [Menjalankan backend](../../backend/README.md) · [Menjalankan frontend](../../frontend/README.md)

| Proses | Konfigurasi |
| --- | --- |
| Next.js | `EMS_BACKEND_URL` adalah origin internal HTTP(S) Go. Gunakan `npm ci`, `npm run build` dan `npm start` atau artefak setara yang menyertakan `.next`, `public`, konfigurasi Next dan dependency lock. |
| API Go | `DATABASE_URL` untuk role aplikasi, `HTTP_ADDR` pada alamat privat, dan `APP_ORIGIN` sama persis dengan origin browser HTTPS. Build dengan `go build -o ems-api ./cmd/api`. |
| Goose | `DATABASE_URL` untuk role migrasi. Aplikasi membutuhkan izin SELECT pada `public.goose_db_version` untuk readiness. Jalankan migrasi sebagai langkah rilis terpisah. |
| Avatar | `AVATAR_DIR` menunjuk volume privat persisten. Salin avatar historis di `frontend/public/uploads/avatars` dengan nama asli dan verifikasi SHA-256. Jika nama yang sama sudah tersedia, cocokkan hash sebelum menyalin. Sertakan volume ini dalam backup. |
| SMTP | `SMTP_EMAIL` dan `SMTP_PASSWORD` disuntikkan pada proses Go. Gunakan akun pengirim yang sesuai lingkungan dan uji email nyata sebelum membuka reset password atau notifikasi di produksi. |

Tempatkan reverse proxy TLS di depan Next.js dan batasi akses langsung ke Go dan PostgreSQL. Simpan secret di konfigurasi deployment. Selaraskan batas body proxy dengan foto profil hingga 4 MiB sebelum pengodean. Atur batas laju ingress untuk login dan reset berdasarkan IP pengguna yang tervalidasi. Pada topologi bawaan, pembatasan Go berdasarkan IP melihat alamat proxy Next.js dan akun tetap memiliki pembatas terpisah. Isi `TRUSTED_PROXY_CIDRS` hanya bila jalur proxy tepercaya mengendalikan header forwarded. Gunakan `/healthz` sebagai liveness dan `/readyz` sebagai readiness. [Deployment Next.js](https://nextjs.org/docs/15/app/guides/self-hosting)

## Runbook cutover dan rollback

Checkpoint lokal `checkpoints/phase5-pre-cleanup-20261126-103024` menunjuk ke `26160d13efc1e0e64b06320714dfed4a2301e4e7`. Bundle Git terverifikasi, binary rollback, frontend produksi sebelumnya, dump rehearsal, manifest SHA-256, dan salinan privat avatar berada di `%LOCALAPPDATA%\EMS\Backups\phase5-20261126-103024`. Checkpoint mengambil snapshot working tree melalui indeks terpisah sehingga staging proyek tetap utuh. Bundle mengecualikan kredensial dan upload. Dump memuat fixture rehearsal. Salinan avatar privat disimpan terpisah dari bundle.

Untuk membaca kode lama di direktori terpisah, jalankan `git worktree add --detach ../ems-pre-cleanup 26160d13efc1e0e64b06320714dfed4a2301e4e7`. Jika ref lokal hilang, verifikasi `pre-cleanup.bundle` dengan `git bundle verify` dan pulihkan ref checkpoint dari bundle sebelum membuat worktree.

1. Simpan artefak frontend, binary Go, lockfile dan dependensi rilis lama. Cadangkan PostgreSQL dengan `pg_dump -Fc` dan salin volume avatar. Simpan keduanya dengan akses terbatas. Pulihkan terlebih dahulu ke database kosong terisolasi dengan `pg_restore --exit-on-error`. Bandingkan jumlah baris, digest data historis, fingerprint skema, dan hash avatar. [Pemulihan PostgreSQL](https://www.postgresql.org/docs/18/app-pgrestore.html)
2. Pastikan avatar historis berada di volume privat sebelum rilis. Path lama tetap sama. Go menerima nama lama dan UUID, memeriksa sesi, serta hanya menyajikan JPEG, PNG, GIF, dan WebP. Verifikasi referensi dan format media di lingkungan sasaran. Pertahankan profil PostgreSQL dan ID file selama cutover.
3. Hentikan atau alihkan mutasi selama penggantian versi. Jalankan `migrate status`, jalankan `up` sesuai kebutuhan, lalu jalankan Go dan periksa readiness. Mulai Next.js dan uji sesi, dashboard, absensi, cuti, slip historis, mutasi gaji, CSV, avatar, dan event outbox. Aktifkan trafik setelah smoke test lulus. Gunakan satu pemilik mutasi dan satu konfigurasi pengiriman email.
4. Untuk rollback, hentikan mutasi, kembalikan artefak aplikasi, dan pertahankan database serta volume yang sama. Database lama hasil restore dipakai untuk latihan pemulihan atau pemulihan data terpisah. Saat rollback penuh, gunakan binary Phase 4 dengan patch baca avatar historis yang ikut direhearsal. Jika hanya frontend yang perlu dikembalikan, API kandidat dapat tetap melayani kontrak sebelumnya. Jangan publikasikan salinan avatar pada release rollback. Jalankan ulang pemeriksaan sesi, hash slip, CSV dan avatar sebelum membuka trafik.

Rehearsal lokal berjalan sebagai Phase 4 → Phase 5 → Phase 4 dengan patch avatar → Phase 5. Cookie yang sama berlaku sepanjang pergantian. Slip historis, hash CSV, catatan absensi, slip baru yang telah dibayar, dan satu event outbox tetap terverifikasi. Permintaan anonim terhadap avatar lama ditolak sekalipun salinan sintetis ada di folder publik kandidat. Hash avatar privat sesuai berkas sumber. Backup dipulihkan ke dua database disposable. Jumlah baris dan SHA-256 cocok pada 19 tabel termasuk ledger dan outbox. Fingerprint skema cocok, dan `up` di salinan yang sudah di versi 4 menghasilkan nol migrasi.

## Verifikasi

- `go test -count=1 ./...` dan `go vet ./...` lulus, termasuk pemetaan 14 model serta integrasi identitas, otorisasi, absensi, cuti dan outbox di PostgreSQL. Bootstrap database kosong, status `SCHEMA_NOT_READY`, peralihan readiness ke `200`, pembatasan bootstrap ulang dan login awal diuji melalui binary.
- Regresi komponen, nilai payroll, slip dibayar, outbox, dashboard, laporan dan CSV juga berjalan langsung di Go. Atur `EMS_PAYROLL_TEST_DATABASE_URL` ke database disposable `phase5_rest` pada `127.0.0.1` setelah Goose `up` untuk mengaktifkannya.
- Sebelum cleanup, 39 tes Vitest lulus ketika suite PostgreSQL dan benchmark diaktifkan. Paritas Go dan Prisma cocok sebesar Rp0 pada seluruh 44 kasus periode serta 17 kolom nominal. Suite final Go memeriksa ulang 43 slip yang dihitung dari fixture referensi tersebut. Slip historis yang sengaja dilewati diuji melalui regresi REST. [Riwayat paritas langsung](phase-4.md#verifikasi)
- Setelah cleanup, `npm ci`, sembilan tes `node:test`, lint, TypeScript, build produksi, dan pemeriksaan runtime lulus. Build menghasilkan 26 jejak produksi, nol Server Actions terdaftar, serta nol jejak Prisma, NextAuth, driver PostgreSQL, atau Nodemailer.
- Smoke test build produksi menguji empat role dengan akses PostgreSQL dari Next.js sengaja dinonaktifkan. Cakupan meliputi login, ganti password, onboarding, avatar privat, absensi dan koreksi, persetujuan cuti, gaji, slip, audit, dan CSV. PostgreSQL mencatat tepat satu event outbox untuk slip yang dibayar. Perbandingan CSS mempertahankan seluruh aturan aktif pada build sebelumnya.
- Setelah cleanup, 19 tabel dalam hasil restore tetap cocok berdasarkan jumlah baris dan SHA-256. Goose melaporkan versi 1–4 sudah diterapkan dan `up` menghasilkan nol perubahan. Keenam SQL historis dan metadata arsipnya cocok dengan snapshot Git.
- Benchmark payroll memakai 25 karyawan sintetis, 20 sampel terukur per versi setelah dua pemanasan, dan urutan versi bergantian. Prisma diukur dari service langsung. Go diukur lewat HTTP loopback termasuk audit dan transaksi. Hasil ini menggambarkan fixture lokal pada satu mesin.

| Generate November | P50 | P95 |
| --- | ---: | ---: |
| Prisma legacy | 260,0 ms | 326,8 ms |
| Go REST | 17,5 ms | 37,9 ms |

## Audit keamanan dan paket yang dibersihkan

Sesi memakai token acak dan digest tersimpan. Cookie menggunakan HttpOnly, SameSite=Lax, dan Secure pada origin HTTPS. Mutasi memeriksa Origin dan pemanggil. Verifikasi mencakup cakupan pemilik dan tim, akses admin, lockout, penolakan lintas origin, transaksi payroll, serta unduhan privat. CSV menetralkan nilai teks yang dapat dianggap formula. SMTP eksternal dimatikan selama rehearsal.

`govulncheck` menemukan nol kerentanan yang terjangkau dari kode backend dan tiga temuan pada modul yang tidak dipanggil. Audit npm pada saat cleanup mencatat satu entri tinggi untuk PostCSS dan satu entri sedang untuk paket Next yang membawanya. Audit seluruh lockfile saat itu mencatat satu tinggi, tujuh sedang, dan nol kritis. Enam entri tambahan berasal dari rantai TypeScript ESLint dan minimatch untuk development. Status setelah patch PostCSS tercatat di audit akhir. [Hasil audit dependensi terbaru](../final-audit.md#keamanan)

Cleanup menghapus `frontend/src/server`, Server Actions bisnis, konfigurasi dan seed Prisma, route dan tipe NextAuth, serta aturan npm `legacy-peer-deps`. Transport frontend dan pendaftaran route Go dikelompokkan berdasarkan tanggung jawab. Enam SQL historis dan metadata migrasinya tersedia di `backend/migrations/legacy/` dan cocok dengan checkpoint. Ledger Goose dan ledger Prisma tetap tersimpan di PostgreSQL.

Enam belas deklarasi paket langsung dihapus. Paket produksi yang dihapus adalah `@auth/core`, `next-auth`, `@prisma/adapter-pg`, `@prisma/config`, `bcryptjs`, `dotenv`, `nodemailer`, `pg`, dan `zod`. Paket development yang dihapus adalah `@prisma/client`, `prisma`, `tsx`, `@types/bcryptjs`, `@types/nodemailer`, `@types/pg`, dan `vitest`. Tes UI dan transport tetap tersedia lewat `node:test`.
