-- TELC Voll — Student profile onboarding
-- Run once on an existing Supabase/Postgres database. Safe to re-run.
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
ALTER TABLE students ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS idx_students_profile_completed ON students(profile_completed);
