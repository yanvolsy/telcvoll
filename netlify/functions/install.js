const bcrypt = require('bcryptjs');
const { db } = require('./_lib/db');
const { json, clientIp } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');

// One-time setup: creates the admin account. Protected by SETUP_KEY env var
// (since there's no filesystem lock in serverless — we lock via the `settings` table instead).
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const setupKey = process.env.SETUP_KEY;
  if (!setupKey || setupKey.length < 24) {
    return json(503, { error: 'SETUP_KEY must be configured and at least 24 characters long.' });
  }

  const ip = clientIp(event);
  const allowed = await rateLimit('install', 5, 900, ip);
  if (!allowed) return json(429, { error: 'Too many installation attempts. Please wait 15 minutes.' });

  if ((event.headers['x-setup-key'] || '') !== setupKey) {
    return json(401, { error: 'Invalid setup key.' });
  }

  const pool = db();
  try {
    const settingsRes = await pool.query("SELECT value FROM settings WHERE key='installed'");
    if (settingsRes.rows[0] && settingsRes.rows[0].value === '1') {
      return json(403, { error: 'Already installed. Delete/rotate SETUP_KEY for safety.' });
    }

    const body = JSON.parse(event.body || '{}');
    const email = (body.email || process.env.ADMIN_EMAIL || 'admin@example.com').trim();
    const password = body.password || process.env.ADMIN_PASSWORD;
    if (!password || password.length < 8) {
      return json(422, { error: 'Password must be at least 8 characters.' });
    }

    const existing = await pool.query('SELECT id FROM admins WHERE email=$1', [email]);
    if (!existing.rows[0]) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO admins(email,password_hash) VALUES($1,$2)', [email, hash]);
    }

    await pool.query(
      "INSERT INTO settings(key,value) VALUES('installed','1') ON CONFLICT (key) DO UPDATE SET value='1'"
    );

    return json(200, { ok: true, message: 'Installation complete. Admin account ready.' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
