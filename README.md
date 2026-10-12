# Field Service Management (FMS) — Backend

REST API untuk sistem manajemen laporan lapangan (field service report). Dibangun dengan **Express + TypeScript**, **Prisma ORM**, dan **PostgreSQL**. Autentikasi menggunakan **JWT** dengan kontrol akses berbasis **role**.

Fitur utama:

- Autentikasi user (login, update password) dengan JWT
- **Role-based access control**: `ADMIN`, `PELAPOR`, `APPROVER`
- Pembuatan akun **hanya oleh Admin** (bukan registrasi mandiri)
- CRUD **Laporan (Report)** dengan field `name`, `description`, `status` (`PENDING` / `APPROVED` / `REJECTED`), dan `location` (opsional)
- **Pelapor** hanya dapat melihat/mengedit laporan miliknya sendiri
- Laporan hanya bisa diedit Pelapor selama status masih `PENDING`
- **Approver** dapat mengubah status (toggle `APPROVED` ↔ `REJECTED`)
- **Riwayat persetujuan**: mencatat siapa yang approve/reject (`decidedBy`) dan kapan (`decidedAt`)

---

## Role & Aturan Akses

| Role | Kemampuan |
|------|-----------|
| `ADMIN` | Membuat akun pengguna baru (register). Akses penuh ke laporan. |
| `PELAPOR` | Membuat laporan. Hanya melihat, mengedit, dan menghapus laporan **miliknya sendiri**. Edit hanya diperbolehkan selama status `PENDING`. |
| `APPROVER` | Mengubah status laporan menjadi `APPROVED` atau `REJECTED` (bisa bolak-balik). Keputusan tercatat beserta waktunya. |

Ringkasan aturan:

- **Pengelolaan akun** — akun dibuat oleh Admin lewat endpoint register (yang kini dilindungi role Admin). Tidak ada registrasi mandiri.
- **Akses laporan** — Pelapor hanya melihat laporan yang dibuatnya. Daftar laporan otomatis difilter berdasarkan `userId` dari token bila role-nya Pelapor.
- **Edit laporan** — Pelapor hanya boleh mengedit laporannya selama status `PENDING`. Setelah `APPROVED`/`REJECTED`, edit ditolak.
- **Ubah status** — hanya Approver (dan Admin) yang boleh mengubah status. Approver bisa mengubah `REJECTED` → `APPROVED` dan sebaliknya.
- **Riwayat persetujuan** — setiap perubahan status menyimpan `decidedById` dan `decidedAt`.

---

## Akun Super Admin (default seed)

Project menyediakan seed untuk membuat **akun Admin pertama**, karena endpoint register hanya bisa diakses oleh Admin. Jalankan:

```bash
npm run db:seed
```

Kredensial default yang dibuat:

| Field | Nilai default |
|-------|---------------|
| Email | `admin@example.com` |
| Password | `Admin#1234` |
| Role | `ADMIN` |

> ⚠️ **Ganti password default ini untuk lingkungan non-development.** Nilai dapat di-override lewat environment variable sebelum menjalankan seed:
>
> ```env
> SEED_ADMIN_EMAIL=admin@perusahaan.com
> SEED_ADMIN_PASSWORD=PasswordKuat#2026
> SEED_ADMIN_NAME=Super Admin
> ```

Seed bersifat **idempoten** (upsert): aman dijalankan berulang, tidak membuat duplikat.

---

## Prasyarat

Pastikan sudah terpasang di komputer Anda:

| Tool | Versi minimum | Keterangan |
|------|---------------|------------|
| [Node.js](https://nodejs.org/) | 18+ (disarankan 20/22 LTS) | Beserta `npm` |
| [PostgreSQL](https://www.postgresql.org/download/) | 13+ | Database server berjalan di lokal atau remote |
| Git | - | Untuk clone repository |

---

## 1. Clone & Masuk ke Folder Project

```bash
git clone <url-repository-anda>
cd field-service-management/server
```

> Semua perintah di bawah dijalankan dari dalam folder `server/`.

---

## 2. Install Dependencies

```bash
npm install
```

Perintah ini otomatis menjalankan `prisma generate` (lewat script `postinstall`) untuk membuat Prisma Client.

---

## 3. Siapkan Database PostgreSQL

Buat dua database di PostgreSQL — satu database utama dan satu *shadow database* (dipakai Prisma saat migrasi):

```sql
CREATE DATABASE dev_db_fms;
CREATE DATABASE dev_db_fms_shadow;
```

Sesuaikan nama database, user, dan password dengan konfigurasi PostgreSQL Anda.

> ⚠️ **Penting: shadow database harus dibuat terlebih dahulu.**
> Project ini menetapkan `SHADOW_DATABASE_URL` secara eksplisit di `prisma.config.ts`, sehingga Prisma **tidak** membuat shadow database secara otomatis. Database `dev_db_fms_shadow` wajib sudah ada **sebelum** menjalankan `prisma migrate dev`. Jika belum dibuat, migrasi akan gagal dengan error:
>
> ```
> Error: P1003 Database `dev_db_fms_shadow` does not exist
> ```
>
> Buat shadow database lewat `psql`:
>
> ```powershell
> psql -U postgres -c "CREATE DATABASE dev_db_fms_shadow;"
> ```

---

## 4. Konfigurasi Environment

Aplikasi memuat file environment berdasarkan `NODE_ENV` dengan pola `.env.<NODE_ENV>`. Jika `NODE_ENV` **tidak di-set**, aplikasi akan membaca file **`.env.dev`** (nilai default `dev`).

Selain itu, Prisma (saat `migrate` / `generate` / `db seed`) membaca file **`.env`** untuk mengambil `DATABASE_URL` dan `SHADOW_DATABASE_URL`.

Jadi siapkan dua file di dalam folder `server/`:

**`.env.dev`** — dipakai oleh aplikasi saat runtime:

```env
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug

# Koneksi database utama
DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms?schema=public"

# Shadow database untuk Prisma migrate
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms_shadow"

# JWT (minimal 32 karakter)
JWT_SECRET=secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=1d

# Daftar origin yang diizinkan (pisahkan dengan koma)
WHITE_LIST_URLS=https://example.com,https://localhost:5000
```

**`.env`** — dipakai oleh Prisma CLI (koneksi database + opsional kredensial seed admin):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms?schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms_shadow"

# Opsional: override kredensial admin yang dibuat oleh seed
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin#1234
SEED_ADMIN_NAME=Super Admin
```

> Catatan: biasanya `npm run dev` dijalankan tanpa men-set `NODE_ENV`, sehingga aplikasi membaca `.env.dev`. Jika Anda men-set `NODE_ENV=production`, aplikasi akan mencari file `.env.production`.

Variabel yang wajib diisi (divalidasi saat startup):

| Variabel | Keterangan |
|----------|------------|
| `DATABASE_URL` | Connection string PostgreSQL utama |
| `SHADOW_DATABASE_URL` | Connection string shadow database |
| `JWT_SECRET` | Secret JWT, **minimal 32 karakter** |
| `WHITE_LIST_URLS` | Daftar URL valid dipisah koma |
| `PORT` | Port server (default `5000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `LOG_LEVEL` | `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` \| `silent` |

> Jika salah satu variabel wajib hilang atau tidak valid, aplikasi akan berhenti saat startup dan menampilkan pesan error.

---

## 5. Jalankan Migrasi Database & Seed Admin

Buat tabel di database sesuai schema Prisma:

```bash
npx prisma migrate dev
```

Lalu buat akun Admin pertama (lihat bagian [Akun Super Admin](#akun-super-admin-default-seed)):

```bash
npm run db:seed
```

(Opsional) membuka Prisma Studio untuk melihat data lewat browser:

```bash
npx prisma studio
```

---

## 6. Menjalankan Aplikasi

### Mode Development (auto-reload)

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`. Cek dengan:

```bash
curl http://localhost:5000/heartbeat
# -> ok
```

### Mode Production

```bash
npm run build
npm start
```

- `npm run build` — compile TypeScript ke folder `dist/`
- `npm start` — menjalankan `dist/server.js`

---

## Script yang Tersedia

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan server dengan hot-reload (nodemon + tsx) |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Jalankan hasil build |
| `npm run db:seed` | Buat/pastikan akun Admin pertama (seed) |
| `npm run lint` | Jalankan ESLint |
| `npm run lint:fix` | Perbaiki masalah lint otomatis |
| `npm run format` | Format kode dengan Prettier |
| `npm run typecheck` | Cek tipe tanpa emit |
| `npm test` | Jalankan test (Vitest) |

---

## Ringkasan API

Base URL: `http://localhost:5000`

### Auth / User — `/v1/users`

| Method | Endpoint | Auth | Role | Keterangan |
|--------|----------|------|------|------------|
| POST | `/v1/users/login` | ❌ | - | Login, mengembalikan JWT (membawa `role`) |
| POST | `/v1/users/register` | ✅ | `ADMIN` | **Buat akun pengguna baru** (hanya Admin) |
| PUT | `/v1/users/update-password` | ✅ | semua | Ubah password akun sendiri |
| GET | `/v1/users/:userId` | ✅ | semua | Detail satu user (tanpa password) |

### Laporan / Report — `/v1/reports`

Semua endpoint laporan memerlukan header `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Keterangan |
|--------|----------|------|------------|
| POST | `/v1/reports/create` | semua | **Buat laporan** (pembuat diambil dari token) |
| POST | `/v1/reports` | semua | **Daftar laporan** (Pelapor otomatis hanya laporannya) |
| GET | `/v1/reports/:reportId` | semua* | Detail satu laporan |
| PUT | `/v1/reports/:reportId` | semua* | Update laporan (Pelapor: hanya miliknya & saat `PENDING`) |
| PATCH | `/v1/reports/:reportId/status` | `APPROVER` / `ADMIN` | **Ubah status** `APPROVED` / `REJECTED` + catat pemutus |
| DELETE | `/v1/reports/:reportId` | semua* | Hapus laporan (Pelapor: hanya miliknya) |

> *Untuk role `PELAPOR`, akses dibatasi hanya pada laporan miliknya sendiri. Akses ke laporan milik orang lain akan ditolak dengan `403`.

### Contoh Request

**Login (dapatkan token)**

```bash
curl -X POST http://localhost:5000/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@example.com", "password": "Admin#1234" }'
```

**Buat akun baru (hanya Admin)**

```bash
curl -X POST http://localhost:5000/v1/users/register \
  -H "Authorization: Bearer <token-admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Siti Pelapor",
    "email": "siti@example.com",
    "password": "secret123",
    "role": "PELAPOR"
  }'
```

> `role` opsional. Nilai valid: `ADMIN`, `PELAPOR`, `APPROVER`. Jika tidak dikirim, default-nya `PELAPOR`.

**Buat laporan** (sebagai Pelapor — `userId` otomatis dari token, tidak perlu dikirim)

```bash
curl -X POST http://localhost:5000/v1/reports/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kerusakan AC Lantai 2",
    "description": "AC ruang meeting tidak dingin sejak pagi",
    "location": "Gedung A Lantai 2"
  }'
```

**Tampilkan daftar laporan** (Pelapor otomatis hanya melihat laporannya sendiri)

```bash
curl -X POST http://localhost:5000/v1/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "skip": 0, "take": 10 }'
```

**Ubah status menjadi APPROVED / REJECTED** (hanya Approver/Admin)

```bash
curl -X PATCH http://localhost:5000/v1/reports/<reportId>/status \
  -H "Authorization: Bearer <token-approver>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "APPROVED" }'
```

Respons menyertakan riwayat persetujuan:

```json
{
  "success": true,
  "message": "Report status updated successfully",
  "data": {
    "id": "clx...",
    "status": "APPROVED",
    "decidedById": "clx...",
    "decidedAt": "2026-10-12T16:40:00.000Z",
    "decidedBy": { "id": "clx...", "name": "Siti Approver" }
  }
}
```

---

## Struktur Project

```
server/
├── prisma/
│   ├── schema.prisma        # Model User & Report, enum ReportStatus & UserRole
│   ├── seed.ts              # Seed akun Admin pertama
│   └── migrations/
├── src/
│   ├── app.ts               # Setup Express & routing
│   ├── server.ts            # Entry point & graceful shutdown
│   ├── config/              # Env & Prisma config
│   ├── constants/           # Pesan sukses & error
│   ├── middleware/          # auth (JWT + role), validasi, error handler, security
│   └── features/
│       ├── user/            # Fitur user (login, register oleh Admin, detail, password)
│       └── report/          # Fitur laporan (schema, repo, service, controller, route)
└── package.json
```

---

## Model Data (ringkas)

**User**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | Nama user |
| `email` | `String` unique | Email login |
| `password` | `String` | Hash bcrypt |
| `role` | `UserRole` | `ADMIN` \| `PELAPOR` \| `APPROVER` (default `PELAPOR`) |

**Report**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | Judul laporan |
| `description` | `String` | Deskripsi |
| `status` | `ReportStatus` | `PENDING` \| `APPROVED` \| `REJECTED` (default `PENDING`) |
| `location` | `String?` | Lokasi (opsional) |
| `userId` | `String` | Pembuat laporan (Pelapor) |
| `decidedById` | `String?` | Pemutus status (Approver) — riwayat persetujuan |
| `decidedAt` | `DateTime?` | Waktu keputusan status |

---

## Troubleshooting

- **Aplikasi berhenti saat start dengan pesan env hilang** — pastikan file `.env.dev` ada di folder `server/` dan semua variabel wajib terisi (`JWT_SECRET` minimal 32 karakter). Pastikan juga `NODE_ENV` tidak di-set ke nilai lain yang membuat aplikasi mencari file env berbeda.
- **Tidak bisa membuat akun / register ditolak `401` atau `403`** — endpoint register hanya untuk Admin. Login dulu sebagai Admin (jalankan `npm run db:seed` bila belum ada Admin), lalu sertakan token Admin di header `Authorization`.
- **Gagal konek database** — pastikan PostgreSQL berjalan dan `DATABASE_URL` benar (host, port, user, password, nama database).
- **`Error: P1003 Database 'dev_db_fms_shadow' does not exist`** — shadow database belum dibuat. Buat dulu dengan `psql -U postgres -c "CREATE DATABASE dev_db_fms_shadow;"` lalu jalankan ulang `npx prisma migrate dev`.
- **`npm run typecheck` / `npm run build` error `Invalid value for '--ignoreDeprecations'`** — ini isu bawaan di `tsconfig.json` (`ignoreDeprecations: "6.0"` tidak didukung TypeScript 5.x). Ubah nilainya menjadi `"5.0"`.
