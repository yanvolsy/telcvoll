const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  try {
    const student = await requireStudent(event, { allowIncompleteProfile: true });
    if (!student) return json(401, { authenticated: false, error: 'unauthenticated' });

    const pool = db();

    let studentData = null;
    try {
      const meRes = await pool.query(
        `SELECT id, name, email, first_name, last_name, phone, country,
                auth_provider, profile_completed, profile_updated_at, created_at, last_login_at
         FROM students WHERE id=$1`,
        [student.student_id]
      );
      studentData = meRes.rows[0] || null;
    } catch (_) {
      try {
        const meFallback = await pool.query('SELECT id, name, email, phone FROM students WHERE id=$1', [student.student_id]);
        studentData = meFallback.rows[0] || null;
      } catch (_) {}
    }

    if (!studentData) {
      studentData = {
        id: student.student_id,
        name: student.name || 'Student',
        email: student.email || '',
        phone: student.phone || '',
        profile_completed: true,
      };
    } else if (typeof studentData.profile_completed !== 'boolean') {
      studentData.profile_completed = true;
    }

    // Exercises list with access_mode explicitly guaranteed
    let exercises = [];
    try {
      const exRes = await pool.query(
        `SELECT id, level, section, teil, title, task_type, body, translation, audio_url,
                COALESCE(access_mode, 'paid') AS access_mode, settings_json, status, created_at
         FROM exercises
         WHERE status='published' AND deleted_at IS NULL
         ORDER BY level,
           CASE section
             WHEN 'Lesen' THEN 1 WHEN 'Hören' THEN 2 WHEN 'Sprachbausteine' THEN 3
             WHEN 'Schreiben' THEN 4 WHEN 'Sprechen' THEN 5 ELSE 6 END,
           teil, id DESC`
      );
      exercises = exRes.rows;
    } catch (_) {
      try {
        const exFallback = await pool.query("SELECT *, COALESCE(access_mode, 'paid') AS access_mode FROM exercises WHERE status='published' ORDER BY id DESC");
        exercises = exFallback.rows;
      } catch (_) {}
    }

    let exams = [];
    try {
      const examRes = await pool.query("SELECT * FROM exams WHERE status='published' ORDER BY id DESC");
      exams = examRes.rows;
    } catch (_) {}

    return json(200, {
      authenticated: true,
      student: studentData,
      subscription: student.subscription,
      is_paid: student.is_paid,
      exercises,
      exams,
      ai_enabled: student.ai_enabled,
    });
  } catch (err) {
    console.error('Fatal error in me.js:', err);
    return json(500, { error: err.message });
  }
};
