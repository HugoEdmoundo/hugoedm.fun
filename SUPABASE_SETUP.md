# 🚀 Supabase Setup Guide — Portfolio + CMS

Panduan lengkap setup Supabase backend untuk project portfolio ini **dari nol**, persis seperti konfigurasi yang sekarang berjalan.

> Stack backend: **Supabase** (Postgres + Auth + Storage + Edge Functions). Frontend pakai Vite + React + TypeScript.

---

## 📋 Prasyarat

- Akun [Supabase](https://supabase.com) (free tier cukup)
- Node.js 18+ dan npm/bun terinstall
- (Opsional) [Supabase CLI](https://supabase.com/docs/guides/cli) kalau mau deploy edge function via CLI

---

## 1️⃣ Buat Project Supabase Baru

1. Login ke [supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **New Project** → isi nama, password DB, region terdekat
3. Tunggu provisioning selesai (~2 menit)
4. Catat 3 nilai dari **Project Settings → API**:
   - `Project URL` → contoh `https://xxxxx.supabase.co`
   - `Project ID / Ref` → contoh `xxxxx`
   - `anon public key` → JWT panjang

---

## 2️⃣ Setup Environment Variables

Buat / update file `.env` di root project:

```env
VITE_SUPABASE_PROJECT_ID="<project-ref-kamu>"
VITE_SUPABASE_URL="https://<project-ref-kamu>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key-kamu>"
```

Update juga `supabase/config.toml`:

```toml
project_id = "<project-ref-kamu>"
```

---

## 3️⃣ Jalankan SQL Setup (Schema, RLS, Storage)

Buka **SQL Editor** di Supabase Dashboard → **New Query** → **paste seluruh isi** file:

```
supabase/setup_new_project.sql
```

Klik **Run**. Script ini akan otomatis bikin:

### Tables
- `user_roles` — sistem role (admin/user), terpisah dari profiles (anti privilege escalation)
- `profiles` — data user tambahan
- `site_config` — global config (hero, about, admin_code, CTA, background, dll)
- `projects` — daftar project portfolio
- `skills` — skills + soft skills (kategori `Soft Skills`)
- `gallery` — foto-foto gallery
- `tasks` — todo / task list
- `education` — pendidikan formal & non-formal (field `achievements`, `activities`, dll)
- `experience` — pengalaman kerja (field `achievements`, `technologies`, dll)
- `social_links` — link sosmed

### Enums
- `app_role` → `'admin' | 'user'`

### Functions
- `has_role(user_id, role)` — SECURITY DEFINER, dipakai di RLS untuk cek admin tanpa rekursi
- `handle_new_user()` — auto-insert ke `profiles` saat user baru daftar

### Triggers
- `on_auth_user_created` di `auth.users` → panggil `handle_new_user()`

### RLS Policies
- **Public read** untuk semua tabel konten (projects, skills, gallery, dll)
- **Admin-only write** via `has_role(auth.uid(), 'admin')`
- `user_roles` cuma bisa di-manage admin, user cuma bisa baca role sendiri

### Storage
- Bucket `media` (public) untuk upload gambar/file
- Public read, admin-only upload/update/delete

### Default Data
- 1 row di `site_config` dengan `admin_code = '?hl%3Did<26'` (⚠️ **ganti** lewat CMS setelah login pertama)

---

## 4️⃣ Konfigurasi Auth

Di Dashboard → **Authentication → Providers**:

- **Email**: enable, **disable** "Confirm email" (karena admin pakai email internal `hugoedm.fun@portfolio.local` yang tidak perlu verifikasi)
- Provider lain: tidak diperlukan (project ini cuma 1 admin via access code)

Di **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5173` (dev) atau domain production kamu
- **Redirect URLs**: tambahkan domain preview & production

---

## 5️⃣ Deploy Edge Function: `seed-admin`

Edge function ini yang bikin/sync user admin berdasarkan access code di `site_config`.

### Opsi A — via Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref <project-ref-kamu>
npx supabase functions deploy seed-admin --no-verify-jwt
```

### Opsi B — via Dashboard
1. Dashboard → **Edge Functions** → **Deploy a new function**
2. Nama: `seed-admin`
3. Paste isi `supabase/functions/seed-admin/index.ts`
4. Set **Verify JWT** = **OFF** (function ini dipanggil dari login page tanpa session)

### Secrets yang dibutuhkan (otomatis tersedia):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Keduanya sudah di-inject otomatis oleh Supabase ke setiap edge function — **tidak perlu set manual**.

---

## 6️⃣ Login Admin Pertama Kali

1. Jalankan project: `npm run dev`
2. Buka `/admin/login`
3. Masukkan access code: **`?hl%3Did<26`** (default dari setup SQL)
4. Frontend akan call edge function `seed-admin`:
   - Validasi access code vs `site_config.admin_code`
   - Bikin user `hugoedm.fun@portfolio.local` di `auth.users` (kalau belum ada)
   - Assign role `admin` di `user_roles`
   - Sign in dengan email + password (= access code)
5. Setelah masuk dashboard, **langsung ganti access code** di tab **Account Security**

---

## 7️⃣ Struktur Folder Backend di Repo

```
supabase/
├── config.toml                          # project_id
├── setup_new_project.sql                # full schema + RLS + storage
├── functions/
│   └── seed-admin/
│       └── index.ts                     # admin bootstrap function
└── migrations/                          # auto-generated kalau pakai migration tool
```

---

## ✅ Checklist Final

- [ ] Project Supabase dibuat
- [ ] `.env` diisi dengan URL + anon key + project ID
- [ ] `supabase/config.toml` di-update `project_id`
- [ ] `setup_new_project.sql` sudah di-run di SQL Editor
- [ ] Edge function `seed-admin` sudah deployed (verify_jwt = false)
- [ ] Email auth enabled, confirm email disabled
- [ ] Bisa login ke `/admin/login` pakai access code default
- [ ] Access code sudah diganti via Account Security

---

## 🆘 Troubleshooting

**"No site config found"** saat login → SQL setup belum jalan, atau row di `site_config` kehapus. Jalankan ulang bagian `INSERT INTO public.site_config` dari `setup_new_project.sql`.

**"Invalid access code"** → access code yang diketik salah. Cek di Dashboard → Table Editor → `site_config` → kolom `admin_code`.

**Upload gambar gagal di admin** → cek bucket `media` ada dan public, dan policy storage di `setup_new_project.sql` sudah ter-create.

**RLS error "new row violates row-level security policy"** → user belum punya role `admin` di `user_roles`. Login ulang via `/admin/login` supaya `seed-admin` jalan lagi.

**Edge function "Function not found"** → belum deploy. Ulangi langkah 5.

---

Selesai! Backend portfolio siap dipakai 🎉
