-- Run once against the remote Supabase SQL editor if tables already exist.

ALTER TABLE rooms DROP COLUMN IF EXISTS image_url;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS humidity_level VARCHAR(20);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS light_level VARCHAR(20);

-- Prefer NUMERIC with one decimal for temperatures entered as 22.5
ALTER TABLE rooms ALTER COLUMN temperature_level TYPE NUMERIC(4,1)
  USING NULLIF(regexp_replace(temperature_level::text, '[^0-9.-]', '', 'g'), '')::NUMERIC;

ALTER TABLE plants ALTER COLUMN image_url TYPE VARCHAR(512);

ALTER TABLE plant_health_records ADD COLUMN IF NOT EXISTS image_url VARCHAR(512);
ALTER TABLE plant_health_records ALTER COLUMN image_url TYPE VARCHAR(512);
