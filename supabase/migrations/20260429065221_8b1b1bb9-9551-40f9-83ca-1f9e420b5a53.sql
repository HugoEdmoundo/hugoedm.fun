ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS education_type text DEFAULT 'Formal',
  ADD COLUMN IF NOT EXISTS program_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS provider text DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration text DEFAULT '',
  ADD COLUMN IF NOT EXISTS credential_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS topics text DEFAULT '',
  ADD COLUMN IF NOT EXISTS projects_url text DEFAULT '';