# Employee Management System

![Status: Under active development](https://img.shields.io/badge/status-under%20active%20development-orange)

> 🚧 **Status: Under active development.** Features are still being added, and the structure may change over time. Not yet recommended for production use.

Aplikasi HR untuk mengelola data karyawan, absensi, cuti, dan penggajian. Frontend dan backend ada di satu project Next.js.

Stack: Next.js 15 (App Router), React 19, Prisma 7 + PostgreSQL, NextAuth v5, Tailwind CSS 4.

## Instalasi

Siapkan database PostgreSQL kosong, lalu buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ems"
AUTH_SECRET="isi-dengan-string-acak"
AUTH_URL="http://localhost:3000"
SMTP_EMAIL="email@gmail.com"
SMTP_PASSWORD="app-password-gmail"
```

`AUTH_SECRET` bisa dibuat dengan `npx auth secret`. SMTP hanya dipakai untuk email reset password.

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

Buka http://localhost:3000 dan login pakai akun admin dari seed:

- Email: `budisantoso@gmail.com`
- Password: `admin123`

Setelah login pertama akan diminta ganti password.

## Struktur folder

```
prisma/          schema, migrasi, seed
public/
  brand/         logo
  images/seed/   gambar untuk data seed
  uploads/       file upload user (tidak masuk git)
src/
  app/           halaman, layout, API route
  server/        kode yang hanya jalan di server
    auth/        NextAuth, guard role, lockout login
    db/          Prisma client
    utils/
    modules/     per modul: *.actions.ts, *.service.ts, *.repository.ts
  features/      komponen dan hook per modul
  shared/        types, constants, utils, komponen umum
  middleware.ts
```

Komponen di `features/` memanggil backend lewat `*.actions.ts` (server actions). Logika bisnis ada di `*.service.ts`. Repository hanya dipakai kalau query-nya banyak, contohnya modul employees.

Beberapa aturan yang dipegang:

- `features/` tidak import `server/db`, service, atau repository langsung.
- `server/` tidak import dari `features/`.
- Tipe yang dipakai kedua sisi taruh di `shared/types/`.
- Import pakai alias `@/`, kecuali file di folder yang sama.

Penamaan file: komponen `PascalCase.tsx`, hook `use-xxx.ts`, backend `<modul>.<peran>.ts` (misal `leave.service.ts`), tipe `<modul>.types.ts`, sisanya kebab-case.

## Database

Lihat `prisma/schema.prisma`. Ringkasnya:

- Akun: `User`, `Role`, `PasswordResetToken`
- Karyawan: `Employee`, `Department`, `Position`
- Absensi: `Attendance`, `AttendanceCorrection`, `Holiday`
- Cuti: `LeaveRequest`
- Gaji: `Salary`, `PayrollComponent`
- Pengaturan: `CompanySetting`

Nominal uang disimpan sebagai `Int` (rupiah). Kolom tanggal disimpan jam 00:00 UTC, sedangkan "hari ini" dan jam absen dihitung dengan zona `Asia/Jakarta` (lihat `src/shared/utils/date.ts`).

## Role

| Role | Akses |
| --- | --- |
| `SUPER_ADMIN` | semua data |
| `HR` | semua data |
| `MANAGER` | data sendiri dan bawahan langsung |
| `EMPLOYEE` | data sendiri |

Pengecekan role dilakukan di server untuk setiap action, jadi tidak cukup hanya menyembunyikan menu.

## Cara kerja fitur

### Akun

Tidak ada halaman register. Akun dibuat HR/Admin dari menu Karyawan dan mendapat password sementara yang hanya tampil sekali. Saat login pertama user harus ganti password, lalu mengisi onboarding, baru bisa masuk dashboard.

Password minimal 8 karakter dan harus ada huruf dan angka. Setelah 5 kali salah login, akun dikunci 15 menit.

### Karyawan

Jabatan, divisi, tipe kerja, dan gaji diisi HR. Kalau gaji pokok dikosongkan, nilainya diambil dari gaji standar jabatan.

Karyawan yang sudah punya data absensi, cuti, atau gaji tidak bisa dihapus. Ubah statusnya ke `RESIGNED` atau `TERMINATED`, nanti dia otomatis tidak bisa login.

### Absensi

Check-in dan check-out sekali sehari. Telat kalau lewat jam masuk + toleransi, lembur kalau pulang lewat jam pulang. Kalau di hari kerja tidak ada absen: tercatat Izin/Sakit jika ada cuti yang disetujui, Tidak Hadir jika harinya sudah lewat.

Akhir pekan dan hari libur (diatur di Settings > Hari Libur) tidak dihitung hari kerja, baik untuk absensi, durasi cuti, maupun potongan gaji.

Karyawan bisa mengajukan koreksi jam masuk/pulang untuk 30 hari terakhir. Yang menyetujui atasan langsung atau HR/Admin.

### Cuti

Alurnya `PENDING` > `MANAGER_APPROVED` (atasan) > `HR_APPROVED` (HR/Admin). HR/Admin bisa langsung approve sampai final. Penolakan wajib diberi alasan, dan pengaju bisa membatalkan selama belum final.

Durasi cuti dihitung dalam hari kerja. Sisa cuti tahunan = `leaveQuota` dikurangi cuti tahunan yang disetujui di tahun yang sama.

### Gaji

HR/Admin klik "Hitung Gaji" per periode, semua karyawan aktif dihitung sekaligus. Slip yang sudah ditandai dibayar tidak akan dihitung ulang.

Gaji bersih = gaji pokok + tunjangan tetap + lembur - potongan cuti di luar tanggungan - potongan tetap - BPJS karyawan - PPh 21. Tunjangan dan potongan tetap diatur per karyawan di halaman detail karyawan.

Tarif BPJS:

| Program | Perusahaan | Karyawan | Batas dasar |
| --- | --- | --- | --- |
| Kesehatan | 4% | 1% | Rp12.000.000 |
| JHT | 3,7% | 2% | - |
| JP | 2% | 1% | Rp11.086.300 (bisa diubah di Settings) |
| JKK | 0,24% - 1,74% | - | - |
| JKM | 0,3% | - | - |

PPh 21 mengikuti PP 58/2023 dan PMK 168/2023. Januari sampai November pakai TER kategori A/B/C sesuai status PTKP. Desember dihitung ulang setahun pakai tarif Pasal 17, lalu dikurangi pajak yang sudah dipotong sebelumnya. Rumusnya ada di `src/server/modules/salary/payroll.rules.ts`.

Slip gaji bisa dicetak atau disimpan sebagai PDF. Karyawan hanya bisa lihat slip miliknya.

### Organisasi dan laporan

Menu Organization untuk mengelola divisi dan jabatan. Mengubah gaji standar jabatan tidak mengubah gaji karyawan yang sudah ada.

Menu Reports berisi laporan bulanan absensi, gaji, karyawan, dan cuti, semuanya bisa diekspor ke CSV. Laporan gaji hanya untuk HR/Admin, manager hanya melihat timnya.

## Belum dikerjakan

- Perhitungan pajak untuk karyawan yang resign di tengah tahun
- PPh 21 DTP (PMK 105/2025)
- THR dan bonus
- Karyawan tidak tetap / harian
