# Riwayat migrasi sebelum Goose

Enam migrasi SQL dan metadata PostgreSQL di folder ini berasal dari rilis Prisma sebelum migrasi ke Go. Simpan berkas sebagai riwayat skema dan bahan pembanding restore. Semua migrasi aktif berasal dari `backend/migrations/00001_legacy_baseline.sql` dan versi Goose setelahnya.

Database dengan ledger Prisma yang belum diadopsi memakai perintah `go run ./cmd/migrate baseline`, lalu `go run ./cmd/migrate up`. Perintah baseline memeriksa riwayat dan fingerprint skema yang ada. [Panduan migrasi](../../README.md#migrasi-database)
