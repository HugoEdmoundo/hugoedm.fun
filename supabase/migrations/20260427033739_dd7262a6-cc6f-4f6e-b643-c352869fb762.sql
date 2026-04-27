ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS status text DEFAULT '',
  ADD COLUMN IF NOT EXISTS expected_graduation text DEFAULT '';

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS status text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT false;