const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(a.id)::int AS attempts, COALESCE(AVG(a.percent),0) AS avg_score
     FROM students s
     LEFT JOIN attempts a ON a.student_id = s.id
     GROUP BY s.id ORDER BY s.id DESC`
  );
  return json(200, { students: rows });
};
