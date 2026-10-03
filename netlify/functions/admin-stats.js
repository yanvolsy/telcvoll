const { db, ensureSchema } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();
  try {
    await ensureSchema(pool);
  } catch (_) {}

  const tables = ['students', 'exercises', 'exams', 'attempts'];
  const stats = { students: 0, exercises: 0, exams: 0, attempts: 0, active_subscriptions: 0 };

  for (const t of tables) {
    try {
      const where = (t === 'exercises') ? 'WHERE deleted_at IS NULL' : '';
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${t} ${where}`);
      stats[t] = rows[0]?.n || 0;
    } catch (err) {
      console.warn(`[admin-stats] count error for ${t}:`, err.message);
      stats[t] = 0;
    }
  }

  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM students WHERE is_paid=TRUE AND subscription_expires_at > NOW()");
    stats.active_subscriptions = rows[0]?.n || 0;
  } catch (err) {
    console.warn('[admin-stats] active subscription count failed:', err.message);
  }

  return json(200, { stats });
};
