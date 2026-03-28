-- SafeSpace Lite: Full Schema
-- Run against your Supabase project via SQL Editor

-- Properties (created on first report/lookup)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_raw TEXT NOT NULL,
  address_normalized TEXT NOT NULL,
  address_hash TEXT NOT NULL UNIQUE,
  city TEXT DEFAULT 'Boulder',
  state TEXT DEFAULT 'CO',
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Violation Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  commenter_id UUID REFERENCES auth.users(id),
  body TEXT NOT NULL CHECK (char_length(body) <= 2000),
  is_anonymous BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Landlord Rebuttals
CREATE TABLE IF NOT EXISTS rebuttals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  landlord_email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  stripe_payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful votes (one per user per comment)
CREATE TABLE IF NOT EXISTS helpful_votes (
  user_id UUID REFERENCES auth.users(id),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, comment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_hash ON properties(address_hash);
CREATE INDEX IF NOT EXISTS idx_reports_property ON reports(property_id);
CREATE INDEX IF NOT EXISTS idx_comments_property ON comments(property_id);
CREATE INDEX IF NOT EXISTS idx_rebuttals_report ON rebuttals(report_id);

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebuttals ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpful_votes ENABLE ROW LEVEL SECURITY;

-- Properties: anyone can read, authenticated users can insert
CREATE POLICY "properties_select" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Reports: anyone can read non-hidden, authenticated users can insert
CREATE POLICY "reports_select" ON reports FOR SELECT USING (is_hidden = false);
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Comments: anyone can read non-hidden, authenticated users can insert
CREATE POLICY "comments_select" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = commenter_id);

-- Rebuttals: anyone can read
CREATE POLICY "rebuttals_select" ON rebuttals FOR SELECT USING (true);
-- Rebuttals are inserted via Edge Function after Stripe payment verification

-- Helpful votes: authenticated users can read and insert their own
CREATE POLICY "votes_select" ON helpful_votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON helpful_votes FOR DELETE USING (auth.uid() = user_id);

-- Function to increment helpful_count
CREATE OR REPLACE FUNCTION increment_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET helpful_count = helpful_count + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_insert ON helpful_votes;
CREATE TRIGGER on_vote_insert
  AFTER INSERT ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION increment_helpful_count();

DROP TRIGGER IF EXISTS on_vote_delete ON helpful_votes;
CREATE TRIGGER on_vote_delete
  AFTER DELETE ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_helpful_count();

-- Storage bucket for photo evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload, anyone can view
CREATE POLICY "evidence_select" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "evidence_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.uid() IS NOT NULL);
