-- Add level support to exercises so one access code can open all levels.
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS level VARCHAR(20) NOT NULL DEFAULT 'B2';
UPDATE exercises SET level='B2' WHERE level IS NULL OR TRIM(level)='';
CREATE INDEX IF NOT EXISTS idx_exercises_level_lookup ON exercises(level, section, teil, status);

-- Existing exams were already level-aware; this keeps new exam creation flexible.
