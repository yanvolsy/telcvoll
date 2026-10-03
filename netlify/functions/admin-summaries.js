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
    await pool.query(
      `INSERT INTO summaries(section,teil,title,body,keywords,strategy,common_errors)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [body.section, body.teil, body.title, body.body, body.keywords, body.strategy, body.errors]
    );
    return json(200, { ok: true });
  }

  const { rows } = await pool.query('SELECT * FROM summaries ORDER BY id DESC');
  return json(200, { summaries: rows });
};
