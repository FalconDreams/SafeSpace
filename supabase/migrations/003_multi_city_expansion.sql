-- 003_multi_city_expansion.sql
-- Waitlist table for unsupported cities + ensure properties have city/state

-- Waitlist for users in unsupported cities
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  city text,
  state text,
  zip text,
  created_at timestamptz DEFAULT now()
);

-- RLS: anyone can insert, only service role can read all
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read waitlist"
  ON waitlist FOR SELECT
  USING (auth.role() = 'service_role');

-- Ensure properties table has city and state columns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'city'
  ) THEN
    ALTER TABLE properties ADD COLUMN city text DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'state'
  ) THEN
    ALTER TABLE properties ADD COLUMN state text DEFAULT '';
  END IF;
END $$;
