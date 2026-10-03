const { db } = require('./_lib/db');

exports.handler = async () => {
  const pool = db();
  try {
    // Remove stale failed/cancelled payment requests only. Subscription records
    // and legacy access-code tables are intentionally left untouched.
    const result = await pool.query(`
      UPDATE orders
      SET status='FAILED', updated_at=NOW()
      WHERE status='PENDING'
        AND created_at < NOW() - INTERVAL '2 hours'
      RETURNING id, order_id
    `);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: true, cleaned: result.rowCount })
    };
  } catch (err) {
    console.error('[cleanup-payment-orders]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Cleanup failed' })
    };
  }
};
