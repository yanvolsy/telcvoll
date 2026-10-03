const { db } = require('./db');

// Mirrors the original PHP rate_limit(): allows `maxAttempts` calls per `windowSeconds`.
async function rateLimit(action, maxAttempts, windowSeconds, subject) {
  const key = `${action}:${subject}`;
  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT * FROM rate_limits WHERE rkey=$1 FOR UPDATE',
      [key]
    );
    const now = Math.floor(Date.now() / 1000);
    if (!rows[0]) {
      await client.query(
        'INSERT INTO rate_limits(rkey,attempts,window_started_at) VALUES($1,1,NOW())',
        [key]
      );
      await client.query('COMMIT');
      return true;
    }
    const started = Math.floor(new Date(rows[0].window_started_at).getTime() / 1000);
    if (now - started > windowSeconds) {
      await client.query(
        'UPDATE rate_limits SET attempts=1, window_started_at=NOW() WHERE rkey=$1',
        [key]
      );
      await client.query('COMMIT');
      return true;
    }
    if (rows[0].attempts >= maxAttempts) {
      await client.query('COMMIT');
      return false;
    }
    await client.query('UPDATE rate_limits SET attempts=attempts+1 WHERE rkey=$1', [key]);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { rateLimit };
