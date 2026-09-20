const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();
  const tables = ['students', 'access_codes', 'exercises', 'exams', 'attempts'];
  const stats = {};
  for (const t of tables) {
    const where = (t === 'exercises') ? 'WHERE deleted_at IS NULL' : '';
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${t} ${where}`);
    stats[t] = rows[0].n;
  }
  return json(200, { stats });
};
