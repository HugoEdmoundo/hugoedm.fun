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

Sekarang project ini bisa di-deploy **full serverless** di Vercel (Frontend + API dalam 1 project).

### Setup di Vercel

1. Import repo ke [Vercel](https://vercel.com/)
2. Framework: **Vite** (otomatis terdeteksi)
3. Build Command: 
pm run build
4. Output Directory: dist

### Environment Variables

Tambahkan env berikut di **Vercel → Project → Settings → Environment Variables**:

| Key | Value | Keterangan |
|---|---|---|
| MONGODB_URI | mongodb+srv://... | Koneksi MongoDB Atlas |
| JWT_SECRET | String acak minimal 32 karakter | Wajib |
| JWT_EXPIRES_IN | 1h | Masa hidup token (opsional) |
| LOGIN_RATE_LIMIT | 8 | Percobaan login gagal per IP (opsional) |
| UPLOAD_MAX_MB | 10 | Batas ukuran upload (MB, opsional) |
| PUBLIC_URL | https://your-app.vercel.app | Origin publik API |
| CLIENT_ORIGIN | https://your-app.vercel.app | Origin frontend untuk CORS |
| VITE_API_URL | *(kosongkan)* | Frontend langsung pakai /api (same origin) |

### Upload ke Vercel Blob

1. Buka **Vercel → Storage → Blob → Create Blob Storage**
2. Connect ke project ini
3. BLOB_READ_WRITE_TOKEN akan otomatis di-inject ke environment variables (tidak perlu diisi manual)

### Catatan

- Upload sekarang menggunakan **Vercel Blob** (memory storage). File hasil upload akan punya URL publik dari lob.vercel-storage.com.
- File lama di folder uploads/ yang tersimpan di disk lokal tidak akan muncul di deployment serverless (hanya relevan untuk local/dev).
- API Express di-wrap dengan serverless-http melalui pi/index.ts, dan /api/* diarahkan ke Vercel Function via ercel.json.
- Setelah setup ini, cukup git push untuk auto-deploy.

### Deploy Lokal (Development)

`ash
# Terminal 1 - API
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
`

