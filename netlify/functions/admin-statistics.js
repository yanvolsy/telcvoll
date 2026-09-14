const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();
  const { rows } = await pool.query(
    `SELECT e.section, e.teil, COUNT(a.id)::int AS attempts, COALESCE(AVG(a.percent),0) AS avg_percent
     FROM attempts a JOIN exercises e ON e.id = a.exercise_id
     GROUP BY e.section, e.teil ORDER BY e.section, e.teil`
  );
  return json(200, { rows });
};
