const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
    for (const k of ['site_name', 'logo_text', 'default_passing_percent', 'contact_accounts_json']) {
      await pool.query(
        `INSERT INTO settings(key,value) VALUES($1,$2)
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`,
        [k, String(body[k] ?? '')]
      );
    }
    return json(200, { ok: true });
  }

  const { rows } = await pool.query('SELECT * FROM settings');
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return json(200, { settings: map });
};
