const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  try {
    const student = await requireStudent(event, { allowIncompleteProfile: true });
    if (!student) return json(401, { error: 'unauthenticated' });

    const pool = db();

    // Auto-ensure schema columns exist safely so queries never crash
    try {
      await pool.query(`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS country VARCHAR(100);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP NULL;
        ALTER TABLE exercises ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
        ALTER TABLE exercises ADD COLUMN IF NOT EXISTS level VARCHAR(20) NOT NULL DEFAULT 'B2';
      `);
    } catch (_) {}

    try {
      await pool.query("UPDATE exercises SET level='B2' WHERE level IS NULL OR TRIM(level)=''");
    } catch (_) {}

    let studentData = null;
    try {
      const meRes = await pool.query(
        'SELECT id,name,email,first_name,last_name,phone,country,profile_completed,profile_updated_at FROM students WHERE id=$1',
        [student.student_id]
      );
      studentData = meRes.rows[0] || null;
    } catch (_) {
      try {
        const meFallback = await pool.query('SELECT id,name,email FROM students WHERE id=$1', [student.student_id]);
        studentData = meFallback.rows[0] || null;
      } catch (_) {}
    }

    // Default profile_completed to true if student exists so they are never blocked from dashboard
    if (studentData && typeof studentData.profile_completed !== 'boolean') {
      studentData.profile_completed = true;
    }

    let subscription = null;
    try {
      const accessRes = await pool.query(`
        SELECT c.id AS code_id, c.expires_at, p.name AS plan_name, p.plan_key, p.duration_days
        FROM access_codes c JOIN plans p ON p.id=c.plan_id
        WHERE c.id=$1
      `, [student.code_id]);
      subscription = accessRes.rows[0] || null;
    } catch (_) {}

    let exercises = [];
    try {
      const exRes = await pool.query(
        `SELECT * FROM exercises WHERE status='published' AND deleted_at IS NULL
         ORDER BY level,
           CASE section
             WHEN 'Lesen' THEN 1 WHEN 'Hören' THEN 2 WHEN 'Sprachbausteine' THEN 3
             WHEN 'Schreiben' THEN 4 WHEN 'Sprechen' THEN 5 ELSE 6 END,
           teil, id DESC`
      );
      exercises = exRes.rows;
    } catch (_) {
      try {
        const exFallback = await pool.query("SELECT * FROM exercises WHERE status='published' ORDER BY id DESC");
        exercises = exFallback.rows;
      } catch (_) {}
    }

    let exams = [];
    try {
      const examRes = await pool.query("SELECT * FROM exams WHERE status='published' ORDER BY id DESC");
      exams = examRes.rows;
    } catch (_) {}

    return json(200, {
      student: studentData,
      exercises,
      exams,
      ai_enabled: student.ai_enabled,
      subscription,
    });
  } catch (err) {
    console.error('Fatal error in me.js:', err);
    return json(500, { error: err.message });
  }
};

