# Phase 0 Baseline Migrasi Backend

Catatan historis untuk rilis baseline. [Panduan proyek dan deployment saat ini](phase-5.md)

Baseline ini menjadi pembanding untuk migrasi ke Go dan versi yang dapat dipakai untuk rollback aplikasi. Referensinya adalah working tree di atas `4a19ade`, termasuk perubahan UI lokal. Struktur saat ini masih satu proyek Next.js. Pemisahan `frontend/` dan `backend/` dimulai pada Phase 1.

## Perubahan baseline

- Next.js dan `eslint-config-next` dipasang pada `15.5.29`. `npm run lint` memanggil ESLint dengan konfigurasi proyek. [Rilis Next.js 15.5.29](https://github.com/vercel/next.js/releases/tag/v15.5.29)
- NextAuth `5.0.0-beta.32` dan `@auth/core` `0.41.3` menutup temuan kritis Auth.js pada audit dependensi. [Advisori Auth.js](https://github.com/nextauthjs/next-auth/security/advisories/GHSA-8fpg-xm3f-6cx3)
- Server membatasi pemberian role `SUPER_ADMIN` dan mutasi terhadap akun Super Admin ke Super Admin. Pilihan role untuk HR juga mengikuti kebijakan tersebut. HR tetap dapat mengelola akun biasa. Reset dan unlock untuk akun sendiri tetap dibatasi sesuai alur Profil.
- Pemeriksaan role target dan mutasi akun yang sudah ada berada dalam transaksi serializable. Pemeriksaan sesi di server gagal tertutup saat database gagal dibaca.
- Inventaris penyimpanan mencakup 14 model, enam migrasi Prisma, dan satu berkas avatar lokal saat audit. SQL awal sampai `20261023000000_audit_log` adalah baseline skema di repository. Verifikasi produksi nanti perlu memeriksa `_prisma_migrations`, tipe kolom, constraint, jumlah baris, dan ketersediaan berkas avatar di lingkungan sasaran.

## Pemetaan 67 Server Actions

Path pada tabel direncanakan di bawah `/api/v1`. Kolom verifikasi menetapkan perilaku yang perlu dibuktikan sebelum endpoint menggantikan action. Login, sesi, dan logout berasal dari Route Handler Auth.js. Kandidat penggantinya adalah `POST /auth/login`, `GET /auth/session`, dan `POST /auth/logout`.

| Modul | Server Action | Operasi REST yang direncanakan | Kasus verifikasi |
| --- | --- | --- | --- |
| Akun | `resetUserPasswordAction` | `POST /users/{id}/reset-password` | Password sementara tampil sekali dan target harus menggantinya. HR ditolak untuk Super Admin. |
| Akun | `unlockUserAction` | `POST /users/{id}/unlock` | Lockout dan penghitung gagal direset. Akses akun istimewa diperiksa. |
| Organisasi | `getOrgDataAction` | `GET /organization/form-options` | Pilihan divisi, jabatan, dan atasan tampil sesuai akses. |
| Organisasi | `getOrganizationAction` | `GET /organization` | Daftar divisi dan jabatan beserta jumlah karyawan. |
| Organisasi | `saveDepartmentAction` | `POST /departments`, `PATCH /departments/{id}` | Buat dan ubah, termasuk nama duplikat. |
| Organisasi | `deleteDepartmentAction` | `DELETE /departments/{id}` | Divisi yang masih dipakai ditolak. |
| Organisasi | `savePositionAction` | `POST /positions`, `PATCH /positions/{id}` | Gaji default jabatan berlaku pada pembuatan karyawan yang relevan. |
| Organisasi | `deletePositionAction` | `DELETE /positions/{id}` | Jabatan yang masih dipakai ditolak. |
| Audit | `getAuditLogsAction` | `GET /audit-logs` | Akses admin dan urutan terbaru dahulu. |
| Absensi | `clockInAction` | `POST /attendance/check-in` | Absen ganda, cuti yang disetujui, dan toleransi keterlambatan. |
| Absensi | `clockOutAction` | `POST /attendance/check-out` | Check-in wajib ada dan jam pulang hanya tercatat sekali. |
| Absensi | `getMyTodayAttendanceAction` | `GET /attendance/me/today` | Hari WIB, status, dan jam milik pengguna. |
| Absensi | `getDailyAttendanceAction` | `GET /attendance/daily?date=…` | Filter tanggal dan cakupan sendiri, tim, atau admin. |
| Absensi | `getAttendanceStatsAction` | `GET /attendance/stats` | Angka dan cakupan sama dengan tabel harian. |
| Karyawan | `getRolesAction` | `GET /roles` | HR hanya menerima pilihan role yang boleh ditetapkan. |
| Karyawan | `getEmployeesAction` | `GET /employees` | Filter status/divisi dan penanda masa percobaan. |
| Karyawan | `getEmployeeByIdAction` | `GET /employees/{id}` | Detail, akun, dan format tanggal tanpa hash password. |
| Karyawan | `getEmployeeHistoryAction` | `GET /employees/{id}/history` | Riwayat absensi, cuti, dan gaji lengkap. |
| Karyawan | `createEmployeeAction` | `POST /employees` | Akun dan profil atomik, NIP unik, role valid, password sementara. |
| Karyawan | `updateEmployeeAction` | `PATCH /employees/{id}`, `PATCH /employees/{id}/role` | Email akun sinkron, atasan valid, role lama dan tujuan diperiksa. |
| Karyawan | `promoteEmployeeAction` | `POST /employees/{id}/activate` | Status aktif dan pemeriksaan akun istimewa. |
| Karyawan | `deleteEmployeeAction` | `DELETE /employees/{id}` | Akun sendiri dan karyawan yang memiliki riwayat dilindungi. |
| Identitas | `forgotPasswordAction` | `POST /auth/password/forgot` | Respons seragam dan batas permintaan per akun. |
| Identitas | `validateResetTokenAction` | `POST /auth/password/reset/validate` | Token valid, kedaluwarsa, dan sesudah digunakan. |
| Identitas | `resetPasswordAction` | `POST /auth/password/reset` | Hash baru dan konsumsi token atomik. |
| Profil | `getProfileAction` | `GET /me` | Profil lengkap milik sesi aktif. |
| Profil | `updateProfileAction` | `PATCH /me` | Email profil dan akun konsisten, avatar tetap dapat dimuat. |
| Profil | `updatePasswordAction` | `POST /auth/password/change` | Password lama, konfirmasi, dan alur login ulang. |
| Koreksi | `getAttendanceCorrectionsAction` | `GET /attendance-corrections` | Cakupan dan status yang dapat ditinjau. |
| Koreksi | `submitAttendanceCorrectionAction` | `POST /attendance-corrections` | Batas 30 hari, urutan jam, dan pengajuan aktif yang sama. |
| Koreksi | `approveAttendanceCorrectionAction` | `POST /attendance-corrections/{id}/approve` | Koreksi dan absensi terbarui atomik. |
| Koreksi | `rejectAttendanceCorrectionAction` | `POST /attendance-corrections/{id}/reject` | Alasan wajib dan cakupan peninjau. |
| Koreksi | `cancelAttendanceCorrectionAction` | `POST /attendance-corrections/{id}/cancel` | Pembatalan oleh pemilik saat status mengizinkan. |
| Dashboard | `getDashboardStatsAction` | `GET /dashboard/stats` | Statistik mengikuti role dan cakupan. |
| Dashboard | `getPendingApprovalsAction` | `GET /dashboard/pending-approvals` | Hitungan cuti dan koreksi sesuai kewenangan. |
| Dashboard | `getMyOverviewAction` | `GET /dashboard/me` | Ringkasan karyawan sendiri. |
| Cuti | `getLeaveRequestsAction` | `GET /leave-requests` | Cakupan, riwayat persetujuan, dan aksi yang tersedia. |
| Cuti | `getLeaveStatsAction` | `GET /leave-requests/stats` | Ringkasan konsisten dengan daftar. |
| Cuti | `getMyLeaveBalanceAction` | `GET /leave-requests/me/balance` | Kuota dan pengajuan yang sudah disetujui. |
| Cuti | `getLeavePreviewAction` | `POST /leave-requests/preview` | Durasi hari kerja dan saldo tanpa mutasi. |
| Cuti | `getEmployeesForLeaveAction` | `GET /leave-requests/employee-options` | Admin menerima karyawan aktif dan probation. |
| Cuti | `createLeaveRequestAction` | `POST /leave-requests` | Hari kerja, hari libur, tumpang tindih, dan kuota. |
| Cuti | `approveLeaveAction` | `POST /leave-requests/{id}/approve` | Manager bawahan langsung dan persetujuan akhir HR/Admin. |
| Cuti | `rejectLeaveAction` | `POST /leave-requests/{id}/reject` | Alasan wajib dan kebijakan peninjau. |
| Cuti | `cancelLeaveAction` | `POST /leave-requests/{id}/cancel` | Pembatalan oleh pemilik sebelum status akhir. |
| Onboarding | `completeOnboardingAction` | `POST /me/onboarding` | Data identitas, rekening, kontak darurat, pendidikan, avatar, dan status lengkap. |
| Laporan | `getSalaryTrendAction` | `GET /reports/salary-trend` | Ringkasan admin dan data sendiri untuk pengguna non-admin. |
| Laporan | `getDeptDistributionAction` | `GET /reports/department-distribution` | Distribusi dan akses sesuai role. |
| Laporan | `getAttendanceReportAction` | `GET /reports/attendance?month=…&year=…` | Agregat dan CSV sesuai periode serta cakupan. |
| Laporan | `getSalaryReportAction` | `GET /reports/salary?month=…&year=…` | Agregat dan CSV untuk admin. |
| Laporan | `getEmployeeReportAction` | `GET /reports/employees?month=…&year=…` | Statistik, daftar, dan CSV dengan cakupan tim. |
| Laporan | `getLeaveReportAction` | `GET /reports/leave?month=…&year=…` | Durasi hari kerja, cakupan, dan CSV. |
| Pengaturan | `getCompanySettingAction` | `GET /company-settings` | Jam kerja, kuota, dan parameter payroll yang benar. |
| Pengaturan | `updateCompanySettingAction` | `PATCH /company-settings` | Validasi jam dan nilai serta jejak audit. |
| Pengaturan | `getUsersAction` | `GET /users` | Status akun dan penanda akun sendiri, tanpa kredensial. |
| Hari libur | `getHolidaysAction` | `GET /holidays?year=…` | Daftar tanggal dalam tahun yang dipilih. |
| Hari libur | `getUpcomingHolidaysAction` | `GET /holidays/upcoming?limit=…` | Urutan dan batas jumlah. |
| Hari libur | `createHolidayAction` | `POST /holidays` | Tanggal unik, audit, dan muncul pada kalender. |
| Hari libur | `deleteHolidayAction` | `DELETE /holidays/{id}` | Hari libur terhapus dan tercatat di audit. |
| Payroll | `getPayrollComponentsAction` | `GET /employees/{id}/payroll-components` | Daftar tunjangan dan potongan tetap. |
| Payroll | `addPayrollComponentAction` | `POST /employees/{id}/payroll-components` | Tipe, nilai, target, dan audit. |
| Payroll | `deletePayrollComponentAction` | `DELETE /payroll-components/{id}` | Hapus komponen tanpa mengubah snapshot slip lama. |
| Payroll | `getSalariesAction` | `GET /salaries?month=…&year=…` | Filter periode dan slip pribadi untuk non-admin. |
| Payroll | `generatePayrollAction` | `POST /payroll-periods/{year}/{month}/generate` | Selisih Rp0 untuk fixture BPJS, TER, Desember, lembur, dan potongan. Slip dibayar tetap utuh. |
| Payroll | `markSalaryPaidAction` | `POST /salaries/{id}/mark-paid` | Status, waktu pembayaran, audit, dan notifikasi. |
| Payroll | `markPeriodPaidAction` | `POST /payroll-periods/{year}/{month}/mark-paid` | Hanya slip yang belum dibayar ikut berubah. |
| Payroll | `getSalarySlipAction` | `GET /salaries/{id}/slip` | Cakupan pemilik/admin, nominal historis, dan tampilan cetak. |

## Menjalankan verifikasi

```sh
npm ci
npm run lint
npx tsc --noEmit --incremental false
npm test
npm run build
```

Tes integrasi akses memakai database PostgreSQL sementara bernama `phase0_test` dengan pengguna `phase0` di `127.0.0.1`. Jalankan `prisma migrate deploy` dengan `DATABASE_URL` yang mengarah ke database uji tersebut. Atur `EMS_PHASE0_TEST_DATABASE_URL` ke URL yang sama, lalu jalankan `npm test`. Suite melewati tes integrasi bila variabel itu kosong. Tes membuat role dan karyawan sintetis. Gunakan database yang memang disediakan untuk dibuang setelah pengujian.

Verifikasi Phase 0 mencakup 34 tes, lint, pemeriksaan tipe, dan build produksi. Keenam migrasi lulus di PostgreSQL 18 yang terisolasi. `prisma migrate diff` menunjukkan bahwa hasil migrasi cocok dengan `schema.prisma`. Smoke test HTTP meliputi login dan sesi empat role, akses dashboard dan daftar karyawan, serta pengalihan tamu, ganti password, dan onboarding. `npm audit --omit=dev` melaporkan nol temuan kritis, delapan entri tinggi, dan satu sedang. Entri tersisa perlu ditinjau sebelum deployment publik.

Untuk perbandingan UI fase berikutnya, rekam login, ganti password, onboarding, dashboard, daftar karyawan, absensi, cuti, laporan, dan slip di desktop dan seluler dari fixture yang sama. Gunakan data sintetis dan tanggal tetap untuk perbandingan hasil. Jalankan pemulihan PostgreSQL dan avatar pada lingkungan terisolasi sebelum cutover produksi.

Migrasi sesi ke Go, validasi menyeluruh, upload persisten, transaksi cuti/payroll, dan outbox tetap memiliki kriteria penerimaan pada fase masing-masing. Baseline Phase 0 mempertahankan skema Prisma sebagai sumber data aplikasi saat ini.
