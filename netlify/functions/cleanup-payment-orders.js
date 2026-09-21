const { db } = require('./_lib/db');
const { safeLog } = require('./_lib/security');

// Netlify Scheduled Function: run every 30 minutes.
// Removes only uncompleted payment orders older than 2 hours.
exports.config = { schedule: '*/30 * * * *' };

exports.handler = async () => {
  const pool = db();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Never touch CONFIRMED orders. Only incomplete/failed payment attempts
    // older than two hours are eligible for cleanup.
    const ordersRes = await client.query(`
      SELECT id, order_id, status, access_code, code_id
      FROM orders
      WHERE status IN ('PENDING', 'FAILED', 'CANCELLED')
        AND created_at < NOW() - INTERVAL '2 hours'
      FOR UPDATE
    `);

    let deletedOrders = 0;
    let deletedCodes = 0;

    for (const order of ordersRes.rows) {
      // A non-confirmed order should normally have no access code, but clean
      // one up defensively if an older/legacy record has one attached.
      if (order.code_id) {
        await client.query('DELETE FROM sessions WHERE code_id=$1', [order.code_id]);
        const codeDel = await client.query(
          'DELETE FROM access_codes WHERE id=$1 RETURNING id',
          [order.code_id]
        );
        if (codeDel.rowCount) deletedCodes += 1;
      }

      const delOrder = await client.query(
        'DELETE FROM orders WHERE id=$1 AND status IN (\'PENDING\',\'FAILED\',\'CANCELLED\') RETURNING id',
        [order.id]
      );
      if (delOrder.rowCount) {
        deletedOrders += 1;
        safeLog('STALE_PAYMENT_ORDER_DELETED', {
          orderId: order.order_id,
          previousStatus: order.status,
          hadAccessCode: !!order.access_code
        });
      }
    }

    await client.query('COMMIT');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, deletedOrders, deletedCodes })
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    safeLog('STALE_PAYMENT_CLEANUP_FAILED', { error: error.message });
    return { statusCode: 500, body: JSON.stringify({ ok: false }) };
  } finally {
    client.release();
  }
};
