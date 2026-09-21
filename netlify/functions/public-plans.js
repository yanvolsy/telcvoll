const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');

exports.handler = async () => {
  try {
    const pool = db();
    const rows = (await pool.query(
      `SELECT id, plan_key, name, duration_days, max_attempts, ai_enabled, COALESCE(price_dzd, 0) AS price_dzd
       FROM plans
       WHERE active=TRUE
       ORDER BY duration_days`
    )).rows;
    return json(200, { plans: rows });
  } catch (e) {
    console.error('[PUBLIC PLANS ERROR]', e);
    return json(500, { error: 'Unable to load plans' });
  }
};
