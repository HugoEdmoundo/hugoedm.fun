alter table site_config
  add column if not exists bg_day_url text,
  add column if not exists bg_night_url text;
