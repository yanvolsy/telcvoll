-- TELC Voll: topic revisions / versions
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS parent_exercise_id BIGINT REFERENCES exercises(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS revision_no INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_exercises_parent_revision
  ON exercises(parent_exercise_id, revision_no);

UPDATE exercises
SET revision_no = 0
WHERE parent_exercise_id IS NULL AND revision_no IS NULL;
