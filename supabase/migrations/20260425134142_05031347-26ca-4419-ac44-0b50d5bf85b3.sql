-- Drop blog_posts (no longer used in UI)
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- Education: richer fields
ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS field_of_study text DEFAULT '',
  ADD COLUMN IF NOT EXISTS start_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text DEFAULT '',
  ADD COLUMN IF NOT EXISTS achievements text DEFAULT '',
  ADD COLUMN IF NOT EXISTS activities text DEFAULT '',
  ADD COLUMN IF NOT EXISTS certificate_url text DEFAULT '';

-- Experience: richer fields
ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS employment_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text DEFAULT '',
  ADD COLUMN IF NOT EXISTS start_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsibilities text DEFAULT '',
  ADD COLUMN IF NOT EXISTS achievements text DEFAULT '',
  ADD COLUMN IF NOT EXISTS technologies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reference_contact text DEFAULT '',
  ADD COLUMN IF NOT EXISTS attachment_url text DEFAULT '';