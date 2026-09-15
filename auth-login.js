const crypto = require('crypto');
const { db } = require('./_lib/db');
const { sign, setCookie, clientIp, json } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  const allowed = await rateLimit('login', 10, 900, ip);
  if (!allowed) return json(429, { error: 'Too many login attempts. Please wait 15 minutes.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  // Accept both the new compact codes and older codes that contain spaces.
  const code = String(body.code || '').trim().toUpperCase();
  const normalizedCode = code.replace(/\s+/g, '');
  if (!normalizedCode) return json(422, { error: 'Zugangscode erforderlich.' });

  const pool = db();
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT c.*, p.duration_days, p.ai_enabled
       FROM access_codes c JOIN plans p ON p.id=c.plan_id
       WHERE (c.code=$1 OR REPLACE(UPPER(c.code),' ','')=$1)
         AND c.active=TRUE AND c.expires_at>NOW()`,
      [normalizedCode]
    );
    const c = rows[0];
    if (!c) return json(401, { error: 'invalid' });

    await client.query('BEGIN');
    let studentId = c.student_id;
    if (!studentId) {
      const s = await client.query("INSERT INTO students(name) VALUES('Student') RETURNING id");
      studentId = s.rows[0].id;
      await client.query('UPDATE access_codes SET student_id=$1 WHERE id=$2', [studentId, c.id]);
    }
    await client.query('UPDATE sessions SET active=FALSE WHERE code_id=$1', [c.id]);
    const token = crypto.randomBytes(32).toString('hex');
    await client.query(
      'INSERT INTO sessions(student_id,code_id,token) VALUES($1,$2,$3)',
      [studentId, c.id, token]
    );
    await client.query(
      'UPDATE access_codes SET session_token=$1, last_used_at=NOW() WHERE id=$2',
      [token, c.id]
    );
    await client.query('COMMIT');

    const jwtToken = sign({
      student_id: studentId,
      code_id: c.id,
      session_token: token,
      ai_enabled: !!c.ai_enabled,
    });

    return json(200, { ok: true }, {
      'Set-Cookie': setCookie('student_token', jwtToken, 60 * 60 * 24 * 30),
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return json(500, { error: e.message });
  } finally {
    client.release();
  }
};
