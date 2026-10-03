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
