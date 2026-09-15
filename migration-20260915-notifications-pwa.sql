-- TELC Voll: expiry notifications
CREATE TABLE IF NOT EXISTS notifications(
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, type)
);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id, created_at DESC);
