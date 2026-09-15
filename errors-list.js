const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const pool = db();
  const { rows } = await pool.query(
    `SELECT se.*, i.prompt, e.section, e.teil
     FROM student_errors se
     JOIN items i ON i.id=se.item_id
     JOIN exercises e ON e.id=i.exercise_id
     WHERE se.student_id=$1
     ORDER BY se.error_count DESC, se.last_seen_at DESC`,
    [student.student_id]
  );
  return json(200, { errors: rows });
};
