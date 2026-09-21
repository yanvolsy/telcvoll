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
    // Detect optional legacy columns so the scheduled job remains compatible
    // with databases that were created before code_id was added.
    const colsRes = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='orders'
        AND column_name IN ('code_id','access_code')
    `);
    const orderCols = new Set(colsRes.rows.map(r=>r.column_name));
    const hasCodeId = orderCols.has('code_id');
    const hasAccessCode = orderCols.has('access_code');

    const selectCols = [
      'id','order_id','status',
      hasAccessCode ? 'access_code' : 'NULL::text AS access_code',
      hasCodeId ? 'code_id' : 'NULL::bigint AS code_id'
    ].join(', ');

    const ordersRes = await client.query(`
      SELECT ${selectCols}
      FROM orders
      WHERE status IN ('PENDING','FAILED','CANCELLED')
        AND created_at < NOW() - INTERVAL '2 hours'
      FOR UPDATE
    `);

    let deletedOrders = 0;
    let deletedCodes = 0;

    for (const order of ordersRes.rows) {
      const codeIds = new Set();
      if (order.code_id) codeIds.add(String(order.code_id));

      // Legacy/defensive cleanup: if a non-confirmed order contains a code
      // string, remove the matching access code too.
      if (order.access_code) {
        const codeRows = await client.query(
          'SELECT id FROM access_codes WHERE code=$1',
          [String(order.access_code)]
        );
        for (const row of codeRows.rows) codeIds.add(String(row.id));
      }

      for (const codeId of codeIds) {
        await client.query('DELETE FROM sessions WHERE code_id=$1', [codeId]);
        const codeDel = await client.query(
          'DELETE FROM access_codes WHERE id=$1 RETURNING id',
          [codeId]
        );
        if (codeDel.rowCount) deletedCodes += 1;
      }

      const delOrder = await client.query(
        `DELETE FROM orders
         WHERE id=$1 AND status IN ('PENDING','FAILED','CANCELLED')
         RETURNING id`,
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
