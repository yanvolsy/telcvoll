const { db } = require('./db');
const { studentFromEvent, adminFromEvent } = require('./auth');

// Equivalent of PHP's guard_session(): re-checks the access code is still
// active/unexpired and the session token still matches.
async function requireStudent(event, options = {}) {
  const payload = studentFromEvent(event);
  if (!payload) return null;

  const pool = db();
  try {
    const { rows } = await pool.query(
      'SELECT active, expires_at, session_token FROM access_codes WHERE id=$1',
      [payload.code_id]
    );
    const c = rows[0];
    if (!c || !c.active || new Date(c.expires_at) < new Date()) {
      return null;
    }

    const sessionToken = String(payload.session_token || '').trim();
    const codeToken = String(c.session_token || '').trim();

    let validSession = (codeToken && codeToken === sessionToken);
    if (!validSession && sessionToken) {
      // Check active sessions in sessions table to prevent false invalidation from race conditions
      const sRes = await pool.query(
        'SELECT id FROM sessions WHERE token=$1 AND code_id=$2 AND active=TRUE LIMIT 1',
        [sessionToken, payload.code_id]
      );
      if (sRes.rows[0]) {
        validSession = true;
        // Keep access_codes synced
        await pool.query('UPDATE access_codes SET session_token=$1 WHERE id=$2', [sessionToken, payload.code_id]);
      }
    }

    if (!validSession) {
      return null;
    }

    await pool.query(
      'UPDATE sessions SET last_seen_at=NOW() WHERE token=$1 AND active=TRUE',
      [sessionToken]
    );

    return payload;
  } catch (err) {
    console.error('Error in requireStudent guard:', err);
    // If DB has transient connection error, trust the cryptographically signed unexpired JWT
    return payload;
  }
}

function requireAdmin(event) {
  return adminFromEvent(event);
}

async function requireSession(event) {
  const admin = adminFromEvent(event);
  if (admin) return { role: 'admin' };
  const student = await requireStudent(event);
  if (student) return { role: 'student', ...student };
  return null;
}

module.exports = { requireStudent, requireAdmin, requireSession };

