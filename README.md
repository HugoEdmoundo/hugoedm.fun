# Portfolio + CMS

Monorepo dua paket: **frontend** React + Vite (SPA statis) dan **backend** Express + Mongoose (REST API) yang tersambung ke **MongoDB Atlas**. Ada CMS admin untuk mengelola isi portfolio tanpa sentuh kode.

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui    |
| Data      | TanStack Query                                          |
| Backend   | Express 4, Mongoose 8, MongoDB Atlas                    |
| Auth      | JWT 1 jam (access code tunggal untuk CMS, disimpan sebagai bcrypt hash) |
| Media     | Upload lokal (Multer) + whitelist MIME, disajikan statis dari Express |

---

## Struktur

```
.
├── src/                     # frontend (SPA)
│   ├── components/
│   │   ├── admin/           # 9 tab CMS
│   │   ├── os/              # window manager ("desktop" UI)
│   │   ├── portfolio/       # section landing page
│   │   └── ui/              # shadcn/ui
│   ├── hooks/               # useAuth, dll
│   ├── lib/                 # api.ts (REST client), types.ts, icons.ts (registry ikon)
│   └── pages/               # Index, CVViewer, AdminLogin, AdminDashboard
├── server/                  # backend Express + Mongoose
│   ├── src/
│   │   ├── models/          # 8 schema Mongoose
│   │   ├── routes/          # auth, crud factory, site-config, upload
│   │   ├── middleware/      # JWT auth + error handler
│   │   └── index.ts
│   ├── scripts/             # seed & inspeksi database
│   └── uploads/             # file media (gitignored)
└── portfolio-data.json      # snapshot data portfolio
```

---

## Menjalankan Lokal

Butuh dua terminal (atau dua proses):

```bash
# 1. API + MongoDB
cd server
npm install
cp .env.example .env        # isi MONGODB_URI + JWT_SECRET
npm run dev                 # http://localhost:4000

# 2. Frontend
npm install
npm run dev                 # http://localhost:8990
```

Vite mem-proxy `/api` dan `/uploads` ke `http://localhost:4000`, jadi tidak perlu CORS saat development.

Environment frontend (`.env` di root):

```
VITE_API_URL=              # kosong = pakai /api (proxy dev)
                           # produksi: https://api.domain.tld/api
```

---

## API

Semua endpoint diawali `/api`. Method `POST`/`PUT`/`DELETE` butuh header `Authorization: Bearer <token>`.

| Method   | Endpoint                | Auth | Keterangan                          |
|----------|-------------------------|------|-------------------------------------|
| `GET`    | `/api/health`           | –    | health check                        |
| `POST`   | `/api/auth/login`       | –    | `{ code }` → JWT                    |
| `GET`    | `/api/auth/me`          | ✓    | validasi token                      |
| `GET`    | `/api/auth/code`        | ✓    | `{ configured, hashed }`, bukan plaintext |
| `PUT`    | `/api/auth/code`        | ✓    | ganti access code (dinormalisasi ke hash) |
| `GET`    | `/api/site-config`      | –    | `admin_code` tidak pernah dikirim   |
| `PUT`    | `/api/site-config`      | ✓    | upsert konfigurasi situs            |
| `GET`    | `/api/projects`         | –    | urut `sort_order`                   |
| `POST`   | `/api/projects`         | ✓    | create (boleh kirim `_id`)         |
| `PUT`    | `/api/projects/:id`     | ✓    | update                              |
| `DELETE` | `/api/projects/:id`     | ✓    | hapus                               |
| `POST`   | `/api/upload`           | ✓    | multipart `file` → `{ url }`       |

Pola yang sama berlaku untuk `/skills`, `/gallery`, `/tasks`, `/education`, `/experience`, `/social-links`.

Field `_id` (MongoDB) di-normalisasi jadi `id` oleh REST client di `src/lib/api.ts`, jadi komponen frontend tidak pernah tahu soal `_id`.

---

## Data

Database: `hugoedm_portfolio` (8 collection). Seed idempotent dari snapshot `portfolio-data.json`:

```bash
cd server
npm run seed
```

`npm run seed` aman diulang: memakai `replaceOne` + `upsert` per `_id`, jadi data CMS yang sudah diedit manual tidak akan tertimpa selama `portfolio-data.json` tidak berubah.

Cek isi database:

```bash
npm run inspect
```

Empat media lama (3 screenshot project + 1 logo pendidikan) storage aslinya sudah dihapus, jadi field-nya dikosongkan. Isi ulang lewat tab Projects/Gallery/Experience di CMS.

---

## Keamanan

| Lapis                | Proteksi                                                                     |
|----------------------|------------------------------------------------------------------------------|
| Access code CMS      | Disimpan sebagai bcrypt hash (cost 12); `GET /api/auth/code` hanya melaporkan `{ configured, hashed }` |
| Migrasi lama         | Code plaintext yang sudah ada otomatis di-upgrade ke hash saat login sukses   |
| Login                | Rate limit 8 percobaan / 15 menit per IP (`LOGIN_RATE_LIMIT`), counter direset setelah login sukses |
| JWT                  | Kedaluwarsa 1 jam (`JWT_EXPIRES_IN`), `JWT_SECRET` wajib diset di production   |
| Header               | helmet aktif (nosniff, HSTS, frame-options, CORP cross-origin untuk `/uploads`) |
| Upload               | Whitelist MIME → ekstensi dipetakan server (tidak ikut nama/header client), default maks. 10 MB (`UPLOAD_MAX_MB`), 1 file per request |
| Error                | Error 5xx dicatat di log server, response hanya mengirim pesan                |

Environment server (`server/.env`, lihat `.env.example`):

| Variabel            | Default | Keterangan                                        |
|---------------------|---------|---------------------------------------------------|
| `MONGODB_URI`       | –       | Wajib                                             |
| `JWT_SECRET`        | –       | Wajib di production; fallback dev memunculkan warning |
| `JWT_EXPIRES_IN`    | `1h`    | Masa hidup token                                  |
| `LOGIN_RATE_LIMIT`  | `8`     | Percobaan login gagal per IP per 15 menit         |
| `UPLOAD_MAX_MB`     | `10`    | Batas ukuran upload                               |
| `PUBLIC_URL`        | `http://localhost:4000` | Origin publik API (dipakai untuk URL `/uploads`) |
| `CLIENT_ORIGIN`     | `http://localhost:8990` | Origin frontend untuk CORS                     |

---

## Performa

- Route CMS (`/admin/*`, `/cv`) di-lazy-load lewat `React.lazy`, jadi pengunjung tidak mengunduh dependensi CMS (recharts, cmdk, embla, day-picker).
- `vite.config.ts` memisah manual chunk untuk React, Framer Motion, dan TanStack Query.
- Ikon memakai registry allowlist (`src/lib/icons.ts`, ±126 ikon). Mengimpor namespace `icons` dari `lucide-react` menarik seluruh 3488 ikon (±670 KB). Jalankan ulang generator setiap preset ikon berubah:

```bash
node scripts/gen-icon-registry.mjs
```

---

## Deploy (Full Serverless - Vercel)

Frontend dan API ada di satu project Vercel. API Express di-wrap `serverless-http` lewat
`api/index.ts`, lalu `/api/*` diarahkan ke function itu oleh `vercel.json`.

### Setup di Vercel

1. Import repo ke Vercel
2. Framework: **Vite** (otomatis terdeteksi)
3. Build Command: `npm run build`, Output Directory: `dist`
4. Runtime Node diambil dari `engines.node` di `package.json` (22.x)

### Environment Variables

Tambahkan di **Vercel → Project → Settings → Environment Variables**:

| Key | Value | Keterangan |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Koneksi MongoDB Atlas |
| `JWT_SECRET` | String acak minimal 32 karakter | Wajib di production |
| `JWT_EXPIRES_IN` | `1h` | Masa hidup token |
| `LOGIN_RATE_LIMIT` | `8` | Percobaan login gagal per IP per 15 menit |
| `UPLOAD_MAX_MB` | `10` | Batas ukuran upload |
| `PUBLIC_URL` | `https://<domain-deploy>` | Origin publik API |
| `CLIENT_ORIGIN` | `https://<domain-deploy>` | Origin frontend untuk CORS |
| `VITE_API_URL` | *(kosongkan)* | Frontend memakai `/api` same-origin |

`BLOB_READ_WRITE_TOKEN` **tidak perlu diisi manual** — otomatis ter-inject begitu Blob
diconnect lewat **Vercel → Storage → Blob**. Token ini yang mengaktifkan mode upload
object storage; kalau kosong, upload jatuh ke disk lokal (cukup untuk `npm run dev`).

### Catatan

- Root `package.json` memakai npm `workspaces: ["server"]`, supaya dependency backend
  ikut ter-hoist ke `node_modules` root. Tanpa ini, Vercel tidak memasang
  `express`/`mongoose` untuk function di `api/`.
- Upload memakai dual-mode, dipilih berdasarkan ada/tidaknya `BLOB_READ_WRITE_TOKEN`:
  - token ada → `multer.memoryStorage()` + `@vercel/blob` (butuh untuk serverless)
  - token kosong → `multer.diskStorage()` ke `server/uploads/`
- File lama di `server/uploads/` tidak ikut ter-deploy.Migrasi ulang lewat CMS.

### Develop lokal

Butuh dua terminal; Vite mem-proxy `/api` dan `/uploads` ke port 4000.

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

Frontend http://localhost:8990, API http://localhost:4000.

### Verifikasi sebelum deploy

```bash
npm run build          # frontend
npm --prefix server run typecheck
npm --prefix server test
```
