# 🚀 Supabase Setup Guide — Portfolio + CMS

Panduan lengkap setup backend Supabase untuk project portfolio ini **dari nol** sampai aplikasi bisa dipakai dengan konfigurasi default yang sama persis dengan yang sekarang jalan.

> Stack backend: **Supabase** (Postgres + Auth + Storage + Edge Functions). Frontend: Vite + React + TypeScript.

Pembagian besar:

- **SQL otomatis** → semua schema, RLS, storage, default data sudah di-bundle di `supabase/setup_new_project.sql`. Cukup paste & run sekali.
- **Manual** → 4 langkah singkat (env vars, auth config, deploy edge function, login pertama).

---

## 📋 Prasyarat

- Akun [Supabase](https://supabase.com) (free tier cukup)
- Node.js 18+ + npm/bun
- (Opsional) [Supabase CLI](https://supabase.com/docs/guides/cli) untuk deploy edge function via terminal

---

## 1️⃣ Buat Project Supabase Baru

1. Login [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New Project** → isi nama, password DB, region terdekat
3. Tunggu provisioning (~2 menit)
4. Dari **Project Settings → API**, catat:
   - `Project URL` (contoh `https://xxxxx.supabase.co`)
   - `Project ID / Ref` (contoh `xxxxx`)
   - `anon public key` (JWT panjang)

---

## 2️⃣ Setup Environment Variables (manual)

### a. File `.env` di root project

```env
VITE_SUPABASE_PROJECT_ID="<project-ref-kamu>"
VITE_SUPABASE_URL="https://<project-ref-kamu>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key-kamu>"
```

### b. Update `supabase/config.toml`

```toml
project_id = "<project-ref-kamu>"
```

> ⚠️ File `src/integrations/supabase/client.ts` dan `src/integrations/supabase/types.ts` **auto-generated** — jangan diedit manual.

---

## 3️⃣ Jalankan SQL Setup (otomatis)

Buka **SQL Editor** di Supabase Dashboard → **New Query** → paste **seluruh isi**:

```
supabase/setup_new_project.sql
```

Klik **Run**. Script ini sekali jalan bikin:

| Bagian | Isi |
|---|---|
| **Enum** | `app_role` (`admin`, `user`) |
| **Tables** | `user_roles`, `profiles`, `site_config`, `projects`, `skills`, `gallery`, `tasks`, `education`, `experience`, `social_links` |
| **Functions** | `has_role(user_id, role)` (SECURITY DEFINER, anti-rekursi RLS), `handle_new_user()` |
| **Triggers** | `on_auth_user_created` di `auth.users` |
| **RLS** | Public read untuk semua tabel konten, admin-only write via `has_role()`; `user_roles` admin-only manage + user baca role sendiri |
| **Storage** | Bucket `media` (public) + policies (public read, admin write/update/delete) |
| **Default data** | 1 row di `site_config` dengan `admin_code = '?hl%3Did<26'` |

> Schema penting yang sering dilewat: `education` & `experience` punya field `achievements`, `activities`, `responsibilities`, `technologies[]`, `certificate_url`, `attachment_url`, dst. Semua sudah ter-include.

---

## 4️⃣ Konfigurasi Auth (manual)

Di Dashboard → **Authentication → Providers**:

- **Email**: **Enable** ✅
- **Confirm email**: **Disable** ❌ (penting — admin pakai email internal `hugoedm.fun@portfolio.local` yang tidak perlu verifikasi)
- Provider lain: skip (project ini single-admin via access code)

Di **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:5173` (dev) atau domain production
- **Redirect URLs**: tambahin domain preview & production juga

---

## 5️⃣ Deploy Edge Function `seed-admin` (manual)

Edge function ini yang validate access code dan bikin/sync user admin.

### Opsi A — Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref <project-ref-kamu>
npx supabase functions deploy seed-admin --no-verify-jwt
```

### Opsi B — Dashboard

1. **Edge Functions** → **Deploy a new function**
2. Nama: `seed-admin`
3. Paste isi file `supabase/functions/seed-admin/index.ts`
4. **Verify JWT** = **OFF** (dipanggil dari login page tanpa session)

### Secrets

Tidak perlu set manual — `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` auto-inject ke setiap edge function.

---

## 6️⃣ Login Admin Pertama Kali

1. `npm install && npm run dev`
2. Buka `/admin/login`
3. Masukin access code default: **`?hl%3Did<26`**
4. Flow yang terjadi otomatis:
   - Frontend call edge function `seed-admin`
   - Validate access code vs `site_config.admin_code`
   - Bikin user `hugoedm.fun@portfolio.local` di `auth.users` (kalau belum ada)
   - Assign role `admin` di `user_roles`
   - Sign in dengan email + password (= access code)
5. ⚠️ **Setelah masuk dashboard, langsung ganti access code** lewat tab **Account Security**.

---

## 7️⃣ Struktur Folder Backend

```
supabase/
├── config.toml                          # project_id
├── setup_new_project.sql                # full schema + RLS + storage + default
├── functions/
│   └── seed-admin/
│       └── index.ts                     # admin bootstrap function
└── migrations/                          # incremental history (opsional kalau pakai migration tool)
```

---

## ✅ Checklist Final

- [ ] Project Supabase dibuat, URL + anon key + project ref dicatat
- [ ] `.env` diisi 3 variable `VITE_SUPABASE_*`
- [ ] `supabase/config.toml` di-update `project_id`
- [ ] `setup_new_project.sql` udah di-run di SQL Editor (sukses tanpa error)
- [ ] Email auth enabled, **confirm email disabled**
- [ ] Edge function `seed-admin` deployed dengan **verify_jwt = false**
- [ ] Bisa login `/admin/login` pakai `?hl%3Did<26`
- [ ] Access code diganti via **Account Security**

---

## 🆘 Troubleshooting

**`No site config found`** saat login
→ Default INSERT di `setup_new_project.sql` gagal / row kehapus. Re-run bagian `INSERT INTO public.site_config (...)`.

**`Invalid access code`**
→ Code yang diketik beda dengan `site_config.admin_code`. Cek lewat **Table Editor → site_config → admin_code**.

**Upload gambar gagal di admin (`new row violates row-level security`)**
→ Pastikan bucket `media` ada + public, dan 4 storage policies (`Public can read media`, `Admin can upload/update/delete media`) ter-create. Cek **Storage → Policies**.

**RLS error `new row violates row-level security policy` di tabel konten**
→ User belum punya role `admin` di `user_roles`. Login ulang via `/admin/login` supaya `seed-admin` jalan lagi dan upsert role.

**`Function not found` saat login**
→ Edge function `seed-admin` belum deployed. Ulangi langkah 5.

**`Permission denied for table auth.users`** saat run SQL
→ Trigger `on_auth_user_created` butuh privilege di `auth.users` — Supabase SQL Editor harusnya udah punya akses ini. Kalau error muncul, jalankan ulang lewat **Database → Triggers** UI.

**Hasil query kosong padahal data ada**
→ Default limit Supabase = 1000 row. Tambahin `.range()` atau `.limit()` di query kalau dataset besar.

---

Selesai! Backend portfolio siap dipakai 🎉
