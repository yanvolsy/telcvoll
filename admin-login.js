const crypto = require('crypto');
const { sign, setCookie, clientIp, json } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const password = String(body.password || '');
  const configured = String(process.env.ADMIN_PASSWORD || '');
  if (!configured) return json(500, { error: 'ADMIN_PASSWORD is not configured' });

  const ip = clientIp(event);
  const okIp = await rateLimit('admin_login', 8, 900, ip);
  if (!okIp) return json(429, { error: 'Too many attempts. Please wait 15 minutes.' });

  const a = Buffer.from(password);
  const b = Buffer.from(configured);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!valid) return json(401, { error: 'Invalid password' });

  const token = sign({ admin: true }, '8h');
  return json(200, { ok: true }, {
    'Set-Cookie': setCookie('admin_token', token, 60 * 60 * 8),
  });
};
