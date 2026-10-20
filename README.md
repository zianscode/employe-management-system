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

**Akun & login**
- Tidak ada registrasi publik: semua akun dibuat oleh HR/Admin lewat menu Karyawan.
- Akun baru mendapat password sementara acak (ditampilkan sekali ke HR) dan wajib diganti saat login pertama.
- Alur setelah login: ganti password (jika wajib) → onboarding data pribadi → dashboard.
- Password minimal 8 karakter, berisi huruf dan angka (`src/shared/utils/password-policy.ts`).
- 5 kali login gagal → akun terkunci 15 menit. Pesan error tidak membedakan email tidak terdaftar dan password salah.

**Karyawan**
- Jabatan, divisi, tipe kerja, dan gaji ditetapkan HR; onboarding hanya mengisi data pribadi.
- Gaji pokok kosong → disalin dari gaji standar jabatan.
- Karyawan yang sudah punya riwayat absensi/cuti/gaji **tidak bisa dihapus**; ubah status ke `RESIGNED`/`TERMINATED` (otomatis tidak bisa login).

**Absensi**
- Check-in/out sekali sehari. Terlambat bila lewat jam masuk + toleransi; lewat jam pulang = lembur.
- Tanpa catatan absensi di hari kerja: cuti disetujui → Izin/Sakit, hari sudah lewat → Tidak Hadir, hari ini → Belum Absen.
- Hari libur (Settings → Hari Libur) dan akhir pekan tidak dihitung sebagai hari kerja di absensi, durasi cuti, dan potongan gaji.
- Koreksi absensi: karyawan mengajukan perbaikan jam masuk/pulang (maks. 30 hari ke belakang) dengan alasan; disetujui atasan langsung atau HR/Admin. Saat disetujui, status dihitung ulang dengan rumus yang sama (`attendance.rules.ts`).

**Cuti**
- `PENDING` → (atasan langsung) `MANAGER_APPROVED` → (HR/Admin) `HR_APPROVED` (final). HR/Admin boleh langsung final.
- Ditolak wajib dengan alasan; pemohon bisa membatalkan selama belum final. Tidak boleh menyetujui cuti sendiri (kecuali SUPER_ADMIN).
- Durasi = hari kerja (Senin–Jumat). Sisa cuti tahunan = `leaveQuota` − cuti tahunan disetujui di tahun berjalan (reset otomatis tiap tahun).

**Gaji** (aturan Indonesia, `src/server/modules/salary/payroll.rules.ts`)
- HR/Admin menekan "Hitung Gaji" per periode untuk semua karyawan aktif. Slip yang sudah ditandai dibayar tidak dihitung ulang.
- Komponen: gaji pokok + tunjangan tetap (per karyawan, di halaman detail karyawan) + lembur − potongan cuti diluar tanggungan − potongan tetap − iuran BPJS karyawan − PPh 21.
- BPJS: Kesehatan 4% perusahaan / 1% karyawan (dasar maks. Rp12 jt); JHT 3,7% / 2%; JP 2% / 1% (dasar maks. diatur di Settings, Rp11.086.300 per Maret 2026); JKK 0,24–1,74% dan JKM 0,3% perusahaan. Dasar iuran = gaji pokok + tunjangan tetap.
- PPh 21 (PP 58/2023, PMK 168/2023): Januari–November memakai tarif efektif rata-rata (TER) kategori A/B/C sesuai status PTKP; Desember dihitung ulang setahun dengan tarif Pasal 17 (bruto − biaya jabatan 5% maks. Rp6 jt − iuran JHT & JP karyawan − PTKP), dikurangi PPh yang sudah dipotong. Bruto PPh 21 termasuk premi JKK, JKM, dan BPJS Kesehatan yang dibayar perusahaan.
- Slip gaji menyimpan rincian komponen saat dihitung, bisa dicetak/disimpan PDF dari menu Payroll. Karyawan hanya melihat slip miliknya.
- Belum ditangani: karyawan resign di tengah tahun (perhitungan masa pajak terakhir), insentif PPh 21 DTP (PMK 105/2025), THR/bonus, pegawai tidak tetap.

**Organisasi** (menu Organization, HR/Admin)
- Kelola divisi dan jabatan beserta gaji pokok standar. Divisi/jabatan yang masih dipakai karyawan tidak bisa dihapus.
- Mengubah gaji standar jabatan tidak mengubah gaji karyawan yang sudah ada.

**Laporan** (menu Reports, HR/Admin/Manager) per bulan, bisa diekspor ke CSV
- Absensi: rekap per karyawan + tren 6 bulan (status harian dihitung dengan aturan yang sama dengan halaman Absensi).
- Gaji (HR/Admin saja): total, per divisi, tren 6 bulan.
- Karyawan: per status/divisi/tipe kerja, karyawan baru, masa percobaan.
- Cuti: hari cuti disetujui per jenis dan per karyawan.
- Manager hanya melihat data dirinya dan bawahan langsung.

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
