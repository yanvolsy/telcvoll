-- TELC Platform — Postgres schema (converted from MySQL for Netlify + Supabase/Neon)
-- Run this once in your Postgres database (Supabase: SQL Editor -> New query -> Run).

CREATE TABLE IF NOT EXISTS admins(
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(190) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans(
  id SERIAL PRIMARY KEY,
  plan_key VARCHAR(60) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  duration_days INT NOT NULL,
  max_attempts INT DEFAULT 0,
  ai_enabled BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS access_codes(
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  plan_id INT NOT NULL REFERENCES plans(id),
  student_id BIGINT NULL REFERENCES students(id),
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NOT NULL,
  session_token CHAR(64) NULL,
  last_used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_codes_expires ON access_codes(expires_at);

CREATE TABLE IF NOT EXISTS sessions(
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  code_id BIGINT NOT NULL REFERENCES access_codes(id),
  token CHAR(64) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams(
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level VARCHAR(20) DEFAULT 'B2',
  passing_percent NUMERIC(5,2) DEFAULT 60,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_parts(
  id BIGSERIAL PRIMARY KEY,
  exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  section VARCHAR(30) NOT NULL,
  teil VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL,
  duration_seconds INT DEFAULT 0,
  required_exercises INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS exercises(
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL DEFAULT 'B2',
  section VARCHAR(30) NOT NULL,
  teil VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  body TEXT,
  translation TEXT,
  audio_url TEXT,
  settings_json JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exercises_lookup ON exercises(section, teil, status);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS parent_exercise_id BIGINT REFERENCES exercises(id) ON DELETE CASCADE;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS revision_no INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_exercises_parent_revision ON exercises(parent_exercise_id, revision_no);

CREATE TABLE IF NOT EXISTS exam_exercises(
  exam_part_id BIGINT NOT NULL REFERENCES exam_parts(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 1,
  PRIMARY KEY(exam_part_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS items(
  id BIGSERIAL PRIMARY KEY,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position_no INT NOT NULL,
  prompt TEXT NOT NULL,
  correct_answer TEXT,
  points NUMERIC(8,2) DEFAULT 1,
  explanation TEXT,
  settings_json JSONB
);

CREATE TABLE IF NOT EXISTS item_options(
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  option_key VARCHAR(20) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS attempts(
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  exam_id BIGINT NULL,
  exercise_id BIGINT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP NULL,
  score NUMERIC(10,2) DEFAULT 0,
  max_score NUMERIC(10,2) DEFAULT 0,
  percent NUMERIC(6,2) DEFAULT 0,
  result VARCHAR(30) NULL
);

CREATE TABLE IF NOT EXISTS answers(
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL,
  answer_text TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  points NUMERIC(8,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_errors(
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  wrong_answer TEXT,
  correct_answer TEXT,
  error_count INT DEFAULT 1,
  last_seen_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, item_id)
);

CREATE TABLE IF NOT EXISTS summaries(
  id BIGSERIAL PRIMARY KEY,
  section VARCHAR(80),
  teil VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  keywords TEXT,
  strategy TEXT,
  common_errors TEXT,
  status VARCHAR(20) DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS settings(
  key VARCHAR(80) PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS ai_logs(
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NULL,
  kind VARCHAR(50),
  input_text TEXT,
  output_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits(
  rkey VARCHAR(190) PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 0,
  window_started_at TIMESTAMP NOT NULL
);

INSERT INTO plans(plan_key,name,duration_days,max_attempts,ai_enabled) VALUES
('trial','Trial',2,0,TRUE),
('15d','15 Days',15,0,TRUE),
('30d','30 Days',30,0,TRUE),
('90d','90 Days',90,0,TRUE)
ON CONFLICT (plan_key) DO NOTHING;

INSERT INTO settings(key,value) VALUES
('site_name','TELC Platform'),
('logo_text','TELC'),
('default_passing_percent','60'),
('installed','0')
ON CONFLICT (key) DO NOTHING;
