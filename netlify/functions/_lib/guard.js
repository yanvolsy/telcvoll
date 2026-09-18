const { db } = require('./db');
const { studentFromEvent, adminFromEvent } = require('./auth');

// Equivalent of PHP's guard_session(): re-checks the access code is still
// active/unexpired and the session token still matches (single active device).
async function requireStudent(event, options = {}) {
  const payload = studentFromEvent(event);
  if (!payload) return null;

  const pool = db();
  const { rows } = await pool.query(
    'SELECT active, expires_at, session_token FROM access_codes WHERE id=$1',
    [payload.code_id]
  );
  const c = rows[0];
  if (!c || !c.active || new Date(c.expires_at) < new Date() || c.session_token !== payload.session_token) {
    return null;
  }
  await pool.query(
    'UPDATE sessions SET last_seen_at=NOW() WHERE token=$1 AND active=TRUE',
    [payload.session_token]
  );
  return payload;
}

function requireAdmin(event) {
  return adminFromEvent(event);
}

module.exports = { requireStudent, requireAdmin };
