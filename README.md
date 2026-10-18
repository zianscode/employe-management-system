# Employee Management System

Aplikasi manajemen karyawan full-stack (frontend + backend dalam satu project) berbasis **Next.js 15 (App Router)**, **Prisma + PostgreSQL**, dan **NextAuth v5**.

## Menjalankan project

```bash
npm install
npx prisma migrate dev     # buat/migrasi database
npx prisma db seed         # isi data awal
npm run dev                # http://localhost:3000
```

Variabel environment (`.env`): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `SMTP_EMAIL`, `SMTP_PASSWORD`.

## Struktur folder

```
prisma/                     Schema, migrasi, dan seed database
src/
├── app/                    ROUTING — halaman, layout, dan API route (tipis, hanya merangkai)
│
├── server/                 BACKEND — hanya berjalan di server
│   ├── auth/               Konfigurasi NextAuth (auth.ts, auth.config.ts)
│   ├── db/                 Prisma client
│   ├── utils/              Helper khusus server (api-response)
│   └── modules/<modul>/
│       ├── <modul>.actions.ts      Server Actions ("use server") — pintu masuk dari UI
│       ├── <modul>.service.ts      Business logic (+ query Prisma)
│       └── <modul>.repository.ts   Opsional, bila query modul cukup banyak (contoh: employees)
│
├── features/               FRONTEND — UI per modul
│   └── <modul>/
│       ├── components/     Komponen React khusus modul
│       └── hooks/          Custom hooks (state & pemanggilan action)
│
├── shared/                 DIPAKAI FRONTEND & BACKEND
│   ├── components/         Komponen UI reusable (DataTable, Modal, StatusBadge, ...)
│   ├── providers/          React providers (NextAuthProvider)
│   ├── types/              Tipe data per modul (*.types.ts)
│   └── utils/              Helper murni tanpa side-effect
│
└── middleware.ts           Proteksi route (NextAuth)
```

Modul: `attendance`, `auth`, `dashboard`, `employees`, `leave`, `onboarding`, `profile`, `reports`, `salary`, `settings`, serta `layout` (sidebar & menu, hanya frontend).

## Alur data

```
app/(page)  →  features/<modul>/components  →  server/modules/<modul>/*.actions.ts
                                                      ↓
                                     *.service.ts  →  *.repository.ts  →  Prisma
```

## Database

11 tabel dalam 3 kelompok (lihat `prisma/schema.prisma`):

| Kelompok | Tabel |
| --- | --- |
| Akun | `User`, `Role`, `PasswordResetToken` |
| Karyawan | `Employee`, `Department`, `Position` |
| Operasional | `Attendance`, `LeaveRequest`, `Salary`, `CompanySetting` |

Semua nominal uang bertipe `Int` (rupiah). Tanggal-saja disimpan sebagai tengah malam UTC; "hari ini" dan jam memakai zona waktu `Asia/Jakarta` (`src/shared/utils/date.ts`).

## Aturan bisnis

**Role & akses** (`src/shared/constants/roles.ts`)
- `SUPER_ADMIN`, `HR`: kelola semua data. `MANAGER`: data sendiri + bawahan langsung. `EMPLOYEE`: data sendiri.
- Setiap server action memeriksa role di server (`src/server/auth/guard.ts`), bukan hanya menu yang disembunyikan.

**Karyawan**
- Dibuat oleh HR/Admin → akun login dibuat otomatis dengan password default `<role>123`.
- Gaji pokok kosong → disalin dari gaji standar jabatan.
- Karyawan yang sudah punya riwayat absensi/cuti/gaji **tidak bisa dihapus**; ubah status ke `RESIGNED`/`TERMINATED` (otomatis tidak bisa login).

**Absensi**
- Check-in/out sekali sehari. Terlambat bila lewat jam masuk + toleransi; lewat jam pulang = lembur.
- Tanpa catatan absensi di hari kerja: cuti disetujui → Izin/Sakit, hari sudah lewat → Tidak Hadir, hari ini → Belum Absen.

**Cuti**
- `PENDING` → (atasan langsung) `MANAGER_APPROVED` → (HR/Admin) `HR_APPROVED` (final). HR/Admin boleh langsung final.
- Ditolak wajib dengan alasan; pemohon bisa membatalkan selama belum final. Tidak boleh menyetujui cuti sendiri (kecuali SUPER_ADMIN).
- Durasi = hari kerja (Senin–Jumat). Sisa cuti tahunan = `leaveQuota` − cuti tahunan disetujui di tahun berjalan (reset otomatis tiap tahun).

**Gaji**
- HR/Admin menekan "Hitung Gaji" per periode: gaji pokok + lembur (jam × tarif) − potongan cuti diluar tanggungan (gaji pokok ÷ hari kerja × hari).
- Slip yang sudah ditandai dibayar tidak dihitung ulang. Karyawan hanya melihat slip miliknya.

**Pengaturan** (Settings → Perusahaan): jam kerja, toleransi telat, tarif lembur, hari kerja per bulan, jatah cuti default.

## Aturan kode

- Kode di `features/` **tidak boleh** mengimpor `server/db` atau `*.service.ts`/`*.repository.ts` secara langsung. Akses backend hanya lewat `*.actions.ts`.
- Kode di `server/` **tidak boleh** mengimpor dari `features/`.
- Tipe yang dipakai di dua sisi diletakkan di `shared/types/`.

## Konvensi penamaan

| Jenis | Format | Contoh |
| --- | --- | --- |
| Komponen React | `PascalCase.tsx` | `EmployeeForm.tsx` |
| Hook | `use-kebab-case.ts` | `use-attendance.ts` |
| File backend | `<modul>.<peran>.ts` | `employee.service.ts` |
| Tipe | `<modul>.types.ts` | `leave.types.ts` |
| Utilitas | `kebab-case.ts` | `position-department.ts` |

Import gunakan alias `@/` (contoh: `@/server/modules/leave/leave.actions`), kecuali file dalam folder yang sama (`./`).
