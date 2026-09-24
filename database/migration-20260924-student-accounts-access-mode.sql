-- TELC Voll — Student Accounts Authentication & Free/Paid Content Migration
-- Safe, backward-compatible, and idempotent migration for Postgres / Supabase / Neon

-- 1. Extend students table with authentication & account fields
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'email';
ALTER TABLE students ADD COLUMN IF NOT EXISTS google_id VARCHAR(190) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token VARCHAR(120) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMP NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_token VARCHAR(120) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP NULL;

-- 2. Safely resolve duplicate existing emails before creating unique index
DO $$
DECLARE
    dup RECORD;
    primary_id BIGINT;
BEGIN
    FOR dup IN
        SELECT LOWER(TRIM(email)) AS clean_email, COUNT(*) AS cnt
        FROM students
        WHERE email IS NOT NULL AND TRIM(email) != ''
        GROUP BY LOWER(TRIM(email))
        HAVING COUNT(*) > 1
    LOOP
        -- Choose the primary student record (prefer one with access_codes, orders, or lowest ID)
        SELECT s.id INTO primary_id
        FROM students s
        LEFT JOIN access_codes c ON c.student_id = s.id
        LEFT JOIN orders o ON o.student_id = s.id
        LEFT JOIN attempts a ON a.student_id = s.id
        WHERE LOWER(TRIM(s.email)) = dup.clean_email
        ORDER BY
            (CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN o.id IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END) DESC,
            s.id ASC
        LIMIT 1;

        -- Re-link relations from duplicate records to the primary record
        UPDATE access_codes
        SET student_id = primary_id
        WHERE student_id IN (
            SELECT id FROM students WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id
        );

        UPDATE orders
        SET student_id = primary_id
        WHERE student_id IN (
            SELECT id FROM students WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id
        );

        UPDATE attempts
        SET student_id = primary_id
        WHERE student_id IN (
            SELECT id FROM students WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id
        );

        UPDATE student_errors
        SET student_id = primary_id
        WHERE student_id IN (
            SELECT id FROM students WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id
        )
        AND NOT EXISTS (
            SELECT 1 FROM student_errors se2
            WHERE se2.student_id = primary_id AND se2.item_id = student_errors.item_id
        );

        UPDATE sessions
        SET student_id = primary_id
        WHERE student_id IN (
            SELECT id FROM students WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id
        );

        -- Distinguish secondary duplicate records to satisfy uniqueness without deleting history
        UPDATE students
        SET email = CONCAT(SUBSTRING(email FROM 1 FOR 150), '+dup_', id, '@telcvoll.legacy')
        WHERE LOWER(TRIM(email)) = dup.clean_email AND id != primary_id;
    END LOOP;
END $$;

-- 3. Create unique index for student emails (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_unique_email
ON students (LOWER(TRIM(email)))
WHERE email IS NOT NULL AND TRIM(email) != '';

-- Index for Google account lookup
CREATE INDEX IF NOT EXISTS idx_students_google_id
ON students (google_id)
WHERE google_id IS NOT NULL;

-- Index for password reset lookup
CREATE INDEX IF NOT EXISTS idx_students_reset_token
ON students (reset_token)
WHERE reset_token IS NOT NULL;

-- 4. Extend exercises table with access_mode ('free' | 'paid')
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS access_mode VARCHAR(20) NOT NULL DEFAULT 'paid';

-- Migrate existing access_mode values: convert nulls or legacy 'code_required' to 'paid'
UPDATE exercises
SET access_mode = 'paid'
WHERE access_mode IS NULL
   OR access_mode = 'code_required'
   OR access_mode NOT IN ('free', 'paid');

CREATE INDEX IF NOT EXISTS idx_exercises_access_mode ON exercises(access_mode);

-- Optional: ensure at least one exercise per available teil is marked free if any exist,
-- or leave them all paid by default for admin configuration.
