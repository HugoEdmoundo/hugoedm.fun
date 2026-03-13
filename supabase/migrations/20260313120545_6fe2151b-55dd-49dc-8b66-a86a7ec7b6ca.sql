ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS marketplace_cta_text text NOT NULL DEFAULT 'Visit Marketplace',
ADD COLUMN IF NOT EXISTS marketplace_cta_url text NOT NULL DEFAULT '';

UPDATE public.site_config
SET marketplace_cta_text = COALESCE(NULLIF(marketplace_cta_text, ''), 'Visit Marketplace')
WHERE marketplace_cta_text IS NULL OR marketplace_cta_text = '';