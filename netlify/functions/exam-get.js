const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const id = parseInt((event.queryStringParameters || {}).id || '0', 10);
  if (!id) return json(400, { error: 'Missing id' });

  const pool = db();
  const examRes = await pool.query("SELECT * FROM exams WHERE id=$1 AND status='published'", [id]);
  const exam = examRes.rows[0];
  if (!exam) return json(404, { error: 'Exam not found' });

  // A full published exam is treated as paid if it contains any paid exercise.
  // Never reveal the structure/title of paid exam content to a free account.
  if (!student.is_paid || !student.subscription?.active) {
    const paidRes = await pool.query(
      `SELECT 1
       FROM exam_parts ep
       JOIN exam_exercises ex ON ex.exam_part_id=ep.id
       JOIN exercises e ON e.id=ex.exercise_id
       WHERE ep.exam_id=$1
         AND e.status='published' AND e.deleted_at IS NULL
         AND COALESCE(e.access_mode,'paid') <> 'free'
       LIMIT 1`,
      [id]
    );
    if (paidRes.rows.length) {
      return json(403, { error: 'payment_required', message: 'هذا الامتحان يتطلب اشتراكاً مفعلاً.' });
    }
  }

  const partsRes = await pool.query('SELECT * FROM exam_parts WHERE exam_id=$1 ORDER BY sort_order', [id]);
  const parts = [];
  for (const part of partsRes.rows) {
    const pickRes = await pool.query(
      `SELECT e.id, e.title, e.task_type FROM exam_exercises x
       JOIN exercises e ON e.id=x.exercise_id
       WHERE x.exam_part_id=$1 AND e.status='published'
       ORDER BY RANDOM() LIMIT 1`,
      [part.id]
    );
    parts.push({ ...part, exercise: pickRes.rows[0] || null });
  }

  return json(200, { exam, parts });
};
