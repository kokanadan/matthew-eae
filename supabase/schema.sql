-- =====================================================
-- Portfolio CMS — Supabase Schema
-- Run this in the Supabase SQL editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profile ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                TEXT NOT NULL DEFAULT 'Your Name',
  course_applied      TEXT NOT NULL DEFAULT 'Course Name',
  introduction        TEXT NOT NULL DEFAULT 'A short introduction about yourself.',
  hobbies             TEXT[] DEFAULT '{}',
  personality_traits  TEXT[] DEFAULT '{}',
  personal_quote      TEXT DEFAULT '',
  profile_photo_url   TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row (only one profile row)
INSERT INTO profile (name, course_applied, introduction)
VALUES ('Your Name', 'Your Course', 'Write your introduction here.')
ON CONFLICT DO NOTHING;

-- ── Skills ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id    UUID REFERENCES profile(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  score         INTEGER NOT NULL CHECK (score BETWEEN 1 AND 100),
  description   TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0
);

-- ── Experiences ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title               TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL DEFAULT 'school'
                        CHECK (category IN ('school','cca','leadership','volunteering','external')),
  period              TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  skills_demonstrated TEXT[] DEFAULT '{}',
  photos              JSONB DEFAULT '[]',   -- [{url, caption}]
  display_order       INTEGER DEFAULT 0,
  published           BOOLEAN DEFAULT FALSE,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Achievements ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'academic'
                  CHECK (category IN ('academic','competition','cca','personal','certificate')),
  year          TEXT NOT NULL DEFAULT '',
  explanation   TEXT NOT NULL DEFAULT '',
  reflection    TEXT DEFAULT '',
  photo         JSONB,                    -- {url, caption} or null
  display_order INTEGER DEFAULT 0,
  published     BOOLEAN DEFAULT FALSE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Testimonials ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'testimonial'
                  CHECK (type IN ('teacher_comment','testimonial','nyaa','character_ref','document','other')),
  comment       TEXT NOT NULL DEFAULT '',
  source        TEXT NOT NULL DEFAULT '',
  year          TEXT DEFAULT '',
  media         JSONB,                    -- {url, caption} or null
  display_order INTEGER DEFAULT 0,
  published     BOOLEAN DEFAULT FALSE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT NOT NULL,
  project_type    TEXT NOT NULL DEFAULT '',
  period          TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  my_role         TEXT DEFAULT '',
  skills_used     TEXT[] DEFAULT '{}',
  what_i_learned  TEXT DEFAULT '',
  photos          JSONB DEFAULT '[]',     -- [{url, caption}]
  link            TEXT,
  display_order   INTEGER DEFAULT 0,
  published       BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Write-up ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS writeup (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  main_title      TEXT NOT NULL DEFAULT 'My Personal Statement',
  reflection      TEXT DEFAULT '',
  why_interested  TEXT DEFAULT '',
  motivation      TEXT DEFAULT '',
  growth          TEXT DEFAULT '',
  challenges      TEXT DEFAULT '',
  contribution    TEXT DEFAULT '',
  future_goals    TEXT DEFAULT '',
  highlight_quote TEXT DEFAULT '',
  photo           JSONB,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO writeup (main_title) VALUES ('My Personal Statement')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Row Level Security
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills       ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeup      ENABLE ROW LEVEL SECURITY;

-- Public: read-only for published content
CREATE POLICY "public_read_profile"      ON profile      FOR SELECT USING (true);
CREATE POLICY "public_read_skills"       ON skills       FOR SELECT USING (true);
CREATE POLICY "public_read_experiences"  ON experiences  FOR SELECT USING (published = true);
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT USING (published = true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (published = true);
CREATE POLICY "public_read_projects"     ON projects     FOR SELECT USING (published = true);
CREATE POLICY "public_read_writeup"      ON writeup      FOR SELECT USING (true);

-- Authenticated (admin): full access
CREATE POLICY "admin_all_profile"      ON profile      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_skills"       ON skills       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_experiences"  ON experiences  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_achievements" ON achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_projects"     ON projects     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_writeup"      ON writeup      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- Supabase Storage Bucket
-- =====================================================
-- Run this in Supabase Dashboard > Storage > New bucket
-- Name: portfolio-media
-- Public bucket: YES
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, application/pdf

-- =====================================================
-- Updated_at trigger helper
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_experiences_updated  BEFORE UPDATE ON experiences  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated     BEFORE UPDATE ON projects     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_writeup_updated      BEFORE UPDATE ON writeup      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profile_updated      BEFORE UPDATE ON profile      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Sample placeholder data (optional — delete when ready)
-- =====================================================
INSERT INTO experiences (title, role, category, period, description, skills_demonstrated, published, display_order)
VALUES
  ('Student Council', 'Vice-President', 'leadership', '2023 – 2024',
   'Led school-wide initiatives and represented student voices in key decisions.',
   ARRAY['Leadership','Communication','Event Management'], true, 1),
  ('Environmental Club', 'Member', 'cca', '2022 – 2024',
   'Organised sustainability campaigns and eco-friendly awareness drives.',
   ARRAY['Teamwork','Initiative','Planning'], true, 2)
ON CONFLICT DO NOTHING;

INSERT INTO achievements (title, category, year, explanation, reflection, published, display_order)
VALUES
  ('Gold Award – Science Fair', 'competition', '2023',
   'Won first place in the national secondary school science fair.',
   'This achievement pushed me to think critically and present complex ideas clearly.', true, 1),
  ('NAPFA Gold', 'personal', '2023',
   'Achieved gold standard for the National Physical Fitness Award.',
   'Consistency and discipline made this possible.', true, 2)
ON CONFLICT DO NOTHING;

INSERT INTO projects (title, project_type, period, description, my_role, skills_used, published, display_order)
VALUES
  ('Smart Recycling App', 'Mobile Application', '2023 – 2024',
   'A mobile app that uses image recognition to help users sort recyclables correctly.',
   'Lead developer and project manager',
   ARRAY['React Native','Python','Machine Learning'], true, 1)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (title, type, comment, source, year, published, display_order)
VALUES
  ('Class Teacher Reference', 'teacher_comment',
   'An exceptional student who consistently demonstrates leadership and creativity. Always willing to help peers and go beyond what is expected.',
   'Ms Chen, Form Teacher', '2024', true, 1)
ON CONFLICT DO NOTHING;

UPDATE skills SET score = 85, name = 'Leadership', description = 'Organising teams and driving outcomes', display_order = 1 WHERE id = (SELECT id FROM skills LIMIT 1);
