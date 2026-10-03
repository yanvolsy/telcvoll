const bcrypt = require('bcryptjs');
const { db } = require('./_lib/db');
const { sign, setCookie, clientIp, json } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event, 64 * 1024)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
  const password = String(body.password || '');
  if (!password || password.length > 256) return json(401, { error: 'Invalid password' });

  const ip = clientIp(event);
  const subject = `${ip}:${String(body.email || '').trim().toLowerCase().slice(0,190)}`;
  const okIp = await rateLimit('admin_login', 8, 900, subject);
  if (!okIp) return json(429, { error: 'Too many attempts. Please wait 15 minutes.' });

  try {
    const pool = db();
    const email = String(body.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const res = email
      ? await pool.query('SELECT id,email,password_hash FROM admins WHERE lower(email)=lower($1) LIMIT 1', [email])
      : await pool.query('SELECT id,email,password_hash FROM admins ORDER BY id ASC LIMIT 1');
    const admin = res.rows[0];

    let valid = false;
    if (admin?.password_hash) valid = await bcrypt.compare(password, admin.password_hash);

    // Bootstrap compatibility: only allow the environment password if the DB
    // has no admin account yet. Normal installed sites authenticate against bcrypt.
    if (!admin && process.env.ADMIN_PASSWORD) {
      const configured = String(process.env.ADMIN_PASSWORD);
      const a = Buffer.from(password), b = Buffer.from(configured);
      valid = a.length === b.length && require('crypto').timingSafeEqual(a, b);
    }

    if (!valid) return json(401, { error: 'Invalid password' });

    const token = sign({ admin: true, admin_id: admin?.id || null, email: admin?.email || email || null }, '4h');
    return json(200, { ok: true }, {
      'Set-Cookie': setCookie('admin_token', token, 60 * 60 * 4),
    });
  } catch (e) {
    console.error('admin-login failed', e);
    return json(500, { error: 'Login service unavailable.' });
  }
};
