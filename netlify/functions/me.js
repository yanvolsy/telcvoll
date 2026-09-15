const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const pool = db();
  // Safe migration for already-installed databases. The standalone SQL migration
  // remains available for normal deployment; this guard prevents old databases
  // from breaking the student area before that migration is run.
  await pool.query("ALTER TABLE exercises ADD COLUMN IF NOT EXISTS level VARCHAR(20) NOT NULL DEFAULT 'B2'");
  await pool.query("UPDATE exercises SET level='B2' WHERE level IS NULL OR TRIM(level)=''");

  const meRes = await pool.query('SELECT id,name,email FROM students WHERE id=$1', [student.student_id]);
  const exRes = await pool.query(
    `SELECT * FROM exercises WHERE status='published' AND deleted_at IS NULL
     ORDER BY level,
       CASE section
         WHEN 'Lesen' THEN 1 WHEN 'Hören' THEN 2 WHEN 'Sprachbausteine' THEN 3
         WHEN 'Schreiben' THEN 4 WHEN 'Sprechen' THEN 5 ELSE 6 END,
       teil, id DESC`
  );
  const examRes = await pool.query("SELECT * FROM exams WHERE status='published' ORDER BY id DESC");

  return json(200, {
    student: meRes.rows[0] || null,
    exercises: exRes.rows,
    exams: examRes.rows,
    ai_enabled: student.ai_enabled,
  });
};
