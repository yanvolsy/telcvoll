-- TELC Voll security hardening: prevent legacy-account takeover during registration.
-- Idempotent migration for Supabase / Neon PostgreSQL.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS pending_password_hash VARCHAR(255) NULL;

CREATE INDEX IF NOT EXISTS idx_students_verification_token
  ON students (verification_token)
  WHERE verification_token IS NOT NULL;
