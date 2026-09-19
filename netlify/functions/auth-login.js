const crypto = require('crypto');
const { db } = require('./_lib/db');
const { sign, setCookie, clientIp, json } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('login', 30, 900, ip);
    if (!allowed) return json(429, { error: 'Too many login attempts. Please wait 15 minutes.' });
  } catch (err) {
    console.warn('Rate limit non-fatal error:', err?.message);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  // Robust code normalization: strip all hidden unicode, directional marks, zero-width chars, spaces, and normalize dashes
  let raw = String(body.code || '').trim();
  raw = raw.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u00A0]/g, '');
  const clean = raw.toUpperCase().replace(/\s+/g, '').replace(/[–—−_]/g, '-');
  if (!clean) return json(422, { error: 'Zugangscode erforderlich.' });

  const withHyphen = clean.includes('-') ? clean : (clean.startsWith('TV') ? 'TV-' + clean.slice(2) : 'TV-' + clean);
  const withoutHyphen = clean.replace(/-/g, '');
  const pureSuffix = withoutHyphen.startsWith('TV') ? withoutHyphen.slice(2) : withoutHyphen;

  const pool = db();
  const client = await pool.connect();
  try {

    const { rows } = await client.query(
      `SELECT c.*, p.duration_days, p.ai_enabled
       FROM access_codes c JOIN plans p ON p.id=c.plan_id
       WHERE (
         UPPER(c.code) = $1
         OR UPPER(c.code) = $2
         OR REPLACE(REPLACE(UPPER(c.code),' ',''),'-','') = $3
         OR REPLACE(REPLACE(REPLACE(UPPER(c.code),'TV-',''),' ',''),'-','') = $4
       )
         AND c.active=TRUE AND c.expires_at>NOW()
       ORDER BY c.expires_at DESC LIMIT 1`,
      [clean, withHyphen, withoutHyphen, pureSuffix]
    );
    const c = rows[0];
    if (!c) {
      // Check if code exists but is expired or deactivated to give clear feedback
      const checkRes = await client.query(
        `SELECT active, expires_at FROM access_codes
         WHERE (
           UPPER(code) = $1
           OR UPPER(code) = $2
           OR REPLACE(REPLACE(UPPER(code),' ',''),'-','') = $3
           OR REPLACE(REPLACE(REPLACE(UPPER(code),'TV-',''),' ',''),'-','') = $4
         ) LIMIT 1`,
        [clean, withHyphen, withoutHyphen, pureSuffix]
      );
      if (checkRes.rows[0]) {
        return json(401, { error: 'expired_or_inactive' });
      }
      return json(401, { error: 'invalid' });
    }

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

    let profileCompleted = true;
    try {
      const profileRes = await client.query('SELECT profile_completed FROM students WHERE id=$1', [studentId]);
      profileCompleted = profileRes.rows[0]?.profile_completed === true;
    } catch (_) {
      profileCompleted = true;
    }

    const jwtToken = sign({
      student_id: studentId,
      code_id: c.id,
      session_token: token,
      ai_enabled: !!c.ai_enabled,
    });

    return json(200, { ok: true, profile_completed: profileCompleted, token: jwtToken }, {
      'Set-Cookie': setCookie('student_token', jwtToken, 60 * 60 * 24 * 30),
    });
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    return json(500, { error: e.message });
  } finally {
    client.release();
  }
};
