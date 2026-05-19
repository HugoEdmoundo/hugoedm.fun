-- ============================================================
-- FULL SETUP SCRIPT — Portfolio + CMS
-- Jalankan di Supabase SQL Editor di project BARU (sekali jalan).
-- Script ini bikin: enums, tables, RLS, functions, triggers,
-- storage bucket + policies, dan default site_config row.
--
-- Yang TIDAK bisa lewat SQL (lihat SUPABASE_SETUP.md):
--   - env vars (.env + supabase/config.toml)
--   - Auth provider config (disable confirm email)
--   - Deploy edge function `seed-admin`
-- ============================================================

-- ── 1. ENUMS ─────────────────────────────────────────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ── 2. TABLES ────────────────────────────────────────────────

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'My Portfolio',
  description TEXT DEFAULT '',
  github_username TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  cv_url TEXT DEFAULT '',
  hero_name TEXT DEFAULT 'Your Name',
  hero_headline TEXT DEFAULT 'Full Stack Developer',
  hero_photo_url TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  admin_code TEXT NOT NULL DEFAULT '?hl%3Did<26',
  marketplace_cta_text TEXT NOT NULL DEFAULT 'Visit Marketplace',
  marketplace_cta_url TEXT NOT NULL DEFAULT '',
  bg_day_url TEXT,
  bg_night_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  live_demo_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  screenshot_url TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  github_repo TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT DEFAULT '',
  year TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  field_of_study TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  location TEXT DEFAULT '',
  achievements TEXT DEFAULT '',
  activities TEXT DEFAULT '',
  certificate_url TEXT DEFAULT '',
  status TEXT DEFAULT '',
  expected_graduation TEXT DEFAULT '',
  education_type TEXT DEFAULT 'Formal',
  program_name TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  credential_id TEXT DEFAULT '',
  topics TEXT DEFAULT '',
  projects_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  employment_type TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  responsibilities TEXT DEFAULT '',
  achievements TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  reference_contact TEXT DEFAULT '',
  attachment_url TEXT DEFAULT '',
  status TEXT DEFAULT '',
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Link',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. ENABLE RLS ────────────────────────────────────────────
ALTER TABLE public.user_roles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links  ENABLE ROW LEVEL SECURITY;

-- ── 4. FUNCTIONS ─────────────────────────────────────────────

-- Security definer untuk cek role tanpa rekursi RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-insert profile saat user baru daftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

-- ── 5. TRIGGERS ──────────────────────────────────────────────
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 6. RLS POLICIES ──────────────────────────────────────────

-- user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- profiles
CREATE POLICY "Public can read profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- site_config
CREATE POLICY "Public read site_config" ON public.site_config
  FOR SELECT USING (true);
CREATE POLICY "Admin manage site_config" ON public.site_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- projects
CREATE POLICY "Public read projects" ON public.projects
  FOR SELECT USING (true);
CREATE POLICY "Admin manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- skills
CREATE POLICY "Public read skills" ON public.skills
  FOR SELECT USING (true);
CREATE POLICY "Admin manage skills" ON public.skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- gallery
CREATE POLICY "Public read gallery" ON public.gallery
  FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery" ON public.gallery
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- tasks
CREATE POLICY "Public read tasks" ON public.tasks
  FOR SELECT USING (true);
CREATE POLICY "Admin manage tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- education
CREATE POLICY "Public read education" ON public.education
  FOR SELECT USING (true);
CREATE POLICY "Admin manage education" ON public.education
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- experience
CREATE POLICY "Public read experience" ON public.experience
  FOR SELECT USING (true);
CREATE POLICY "Admin manage experience" ON public.experience
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- social_links
CREATE POLICY "Public read social_links" ON public.social_links
  FOR SELECT USING (true);
CREATE POLICY "Admin manage social_links" ON public.social_links
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── 7. STORAGE ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- ── 8. DEFAULT SITE CONFIG ───────────────────────────────────
-- Access code default: ?hl%3Did<26  (WAJIB diganti lewat tab
-- Account Security setelah login pertama)
INSERT INTO public.site_config (
  site_name, description, github_username,
  hero_name, hero_headline, marketplace_cta_text
)
VALUES (
  'My Portfolio',
  'Welcome to my portfolio',
  '',
  'Your Name',
  'Full Stack Developer',
  'Visit Marketplace'
);

-- ✅ Selesai. Lanjut ke SUPABASE_SETUP.md untuk langkah manual:
--    .env, supabase/config.toml, auth provider, deploy edge function.
