const { db, ensureSchema } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');

exports.handler = async (event) => {
  if (!await requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();
  try {
    await ensureSchema(pool);
  } catch (_) {}

  const stats = { students: 0, exercises: 0, exams: 0, attempts: 0, active_subscriptions: 0 };
  const countQueries = {
    students: 'SELECT COUNT(*)::int AS n FROM students',
    exercises: 'SELECT COUNT(*)::int AS n FROM exercises WHERE deleted_at IS NULL',
    exams: 'SELECT COUNT(*)::int AS n FROM exams',
    attempts: 'SELECT COUNT(*)::int AS n FROM attempts'
  };

  for (const [name, sql] of Object.entries(countQueries)) {
    try {
      const { rows } = await pool.query(sql);
      stats[name] = rows[0]?.n || 0;
    } catch (err) {
      console.warn(`[admin-stats] count error for ${name}:`, err.message);
      stats[name] = 0;
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
