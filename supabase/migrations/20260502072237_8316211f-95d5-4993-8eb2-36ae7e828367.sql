ALTER TABLE public.site_config 
  ADD COLUMN IF NOT EXISTS bg_day_url TEXT,
  ADD COLUMN IF NOT EXISTS bg_night_url TEXT;