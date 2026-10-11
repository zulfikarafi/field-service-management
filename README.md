# Field Service Management (FMS) — Backend

REST API untuk sistem manajemen laporan lapangan (field service report). Dibangun dengan **Express + TypeScript**, **Prisma ORM**, dan **PostgreSQL**. Autentikasi menggunakan **JWT**.

Fitur utama:

- Autentikasi user (register, login, update password)
- CRUD **Laporan (Report)** dengan field wajib: `name`, `description`, dan `status` (`PENDING` / `APPROVED` / `REJECTED`)
- Buat laporan, tampilkan daftar laporan, dan ubah status menjadi `APPROVED` atau `REJECTED`

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

Selain itu, Prisma (saat `migrate` / `generate`) membaca file **`.env`** untuk mengambil `DATABASE_URL` dan `SHADOW_DATABASE_URL`.

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

**`.env`** — dipakai oleh Prisma CLI (minimal berisi koneksi database):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms?schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:password@localhost:5432/dev_db_fms_shadow"
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

## 5. Jalankan Migrasi Database

Buat tabel di database sesuai schema Prisma:

```bash
npx prisma migrate dev --name init
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
| `npm run lint` | Jalankan ESLint |
| `npm run lint:fix` | Perbaiki masalah lint otomatis |
| `npm run format` | Format kode dengan Prettier |
| `npm run typecheck` | Cek tipe tanpa emit |
| `npm test` | Jalankan test (Vitest) |

---

## Ringkasan API

Base URL: `http://localhost:5000`

### Auth / User — `/v1/users`

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/v1/users/register` | ❌ | Registrasi user baru |
| POST | `/v1/users/login` | ❌ | Login, mengembalikan JWT |
| PUT | `/v1/users/update-password` | ✅ | Ubah password |

### Laporan / Report — `/v1/reports`

Semua endpoint laporan memerlukan header `Authorization: Bearer <token>`.

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/v1/reports/create` | **Buat laporan** |
| POST | `/v1/reports` | **Tampilkan daftar laporan** (dengan paginasi & filter) |
| GET | `/v1/reports/:reportId` | Detail satu laporan |
| PUT | `/v1/reports/:reportId` | Update laporan |
| PATCH | `/v1/reports/:reportId/status` | **Ubah status** menjadi `APPROVED` / `REJECTED` |
| DELETE | `/v1/reports/:reportId` | Hapus laporan |

### Contoh Request

**Buat laporan**

```bash
curl -X POST http://localhost:5000/v1/reports/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kerusakan AC Lantai 2",
    "description": "AC ruang meeting tidak dingin sejak pagi",
    "userId": "<user-id>"
  }'
```

**Tampilkan daftar laporan**

```bash
curl -X POST http://localhost:5000/v1/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "skip": 0, "take": 10 }'
```

**Ubah status menjadi APPROVED / REJECTED**

```bash
curl -X PATCH http://localhost:5000/v1/reports/<reportId>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "APPROVED" }'
```

---

## Struktur Project

```
server/
├── prisma/
│   ├── schema.prisma        # Model User & Report, enum ReportStatus
│   └── migrations/
├── src/
│   ├── app.ts               # Setup Express & routing
│   ├── server.ts            # Entry point & graceful shutdown
│   ├── config/              # Env & Prisma config
│   ├── constants/           # Pesan sukses & error
│   ├── middleware/          # auth, validasi, error handler, security
│   └── features/
│       ├── user/            # Fitur autentikasi user
│       └── report/          # Fitur laporan (schema, repo, service, controller, route)
└── package.json
```

---

## Troubleshooting

- **Aplikasi berhenti saat start dengan pesan env hilang** — pastikan file `.env.dev` ada di folder `server/` dan semua variabel wajib terisi (`JWT_SECRET` minimal 32 karakter). Pastikan juga `NODE_ENV` tidak di-set ke nilai lain yang membuat aplikasi mencari file env berbeda.
- **Gagal konek database** — pastikan PostgreSQL berjalan dan `DATABASE_URL` benar (host, port, user, password, nama database).
- **`Error: P1003 Database 'dev_db_fms_shadow' does not exist`** — shadow database belum dibuat. Buat dulu dengan `psql -U postgres -c "CREATE DATABASE dev_db_fms_shadow;"` lalu jalankan ulang `npx prisma migrate dev`.
- **`npm run typecheck` / `npm run build` error `Invalid value for '--ignoreDeprecations'`** — ini isu bawaan di `tsconfig.json` (`ignoreDeprecations: "6.0"` tidak didukung TypeScript 5.x). Ubah nilainya menjadi `"5.0"`.
