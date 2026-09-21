const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { sendAccessCodeEmail } = require('./_lib/email');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();

  if (event.httpMethod === 'GET') {
    try {
    const url = new URL(event.rawUrl || 'http://localhost' + (event.path || '/'), 'http://localhost');
    const search = (url.searchParams.get('search') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const planId = parseInt(url.searchParams.get('plan_id') || 0, 10);
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || 100, 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || 0, 10));

    const clauses = [];
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      clauses.push(`o.status = $${params.length}`);
    }

    if (planId) {
      params.push(planId);
      clauses.push(`o.plan_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      clauses.push(`(
        LOWER(o.order_id) LIKE $${params.length}
        OR LOWER(COALESCE(o.payment_ref, '')) LIKE $${params.length}
        OR LOWER(o.customer_name) LIKE $${params.length}
        OR LOWER(o.customer_email) LIKE $${params.length}
        OR LOWER(COALESCE(o.customer_phone, '')) LIKE $${params.length}
        OR LOWER(COALESCE(o.access_code, '')) LIKE $${params.length}
      )`);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const ordersRes = await pool.query(`
      SELECT o.*, COALESCE(p.duration_days, 0) AS duration_days, COALESCE(p.name, o.plan_name) AS current_plan_name
      FROM orders o
      LEFT JOIN plans p ON p.id=o.plan_id
      ${whereSql}
      ORDER BY o.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    // Summary stats. Older databases may not yet have code_id; keep the
    // orders page usable while the migration is being applied.
    const colRes = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='orders' AND column_name='code_id'
      ) AS has_code_id
    `);
    const hasCodeId = !!colRes.rows[0]?.has_code_id;
    const revenueFilter = hasCodeId
      ? "status='CONFIRMED' AND code_id IS NOT NULL"
      : "status='CONFIRMED' AND access_code IS NOT NULL";

    const statsRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE status='CONFIRMED')::int AS confirmed_orders,
        COUNT(*) FILTER (WHERE status='PENDING')::int AS pending_orders,
        COUNT(*) FILTER (WHERE status='FAILED' OR status='CANCELLED')::int AS failed_orders,
        COALESCE(SUM(amount) FILTER (WHERE ${revenueFilter}), 0)::numeric AS total_revenue
      FROM orders
    `);

    const plansRes = await pool.query('SELECT id, plan_key, name, duration_days, price_dzd, active FROM plans ORDER BY duration_days');

    return json(200, {
      orders: ordersRes.rows,
      stats: statsRes.rows[0] || {},
      plans: plansRes.rows,
      schema: { has_code_id: hasCodeId }
    });
    } catch (err) {
      console.error('admin-orders GET failed:', err?.message || err);
      return json(500, { error: 'تعذر تحميل طلبات الدفع حالياً.' });
    }
  }

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

    const action = String(body.action || '');
    const orderId = String(body.order_id || body.id || '');

    if (action === 'resend-email') {
      const orderRes = await pool.query(
        `SELECT o.*, p.duration_days
         FROM orders o JOIN plans p ON p.id=o.plan_id
         WHERE o.order_id=$1 OR o.id::text=$1`,
        [orderId]
      );
      const order = orderRes.rows[0];
      if (!order) return json(404, { error: 'الطلب غير موجود.' });
      if (order.status !== 'CONFIRMED' || !order.access_code) {
        return json(400, { error: 'لا يمكن إرسال بريد التأكيد لطلب غير مكتمل الدفع.' });
      }

      const emailResult = await sendAccessCodeEmail({
        to: order.customer_email,
        name: order.customer_name,
        planName: order.plan_name,
        durationDays: order.duration_days,
        expiresAt: order.expires_at,
        accessCode: order.access_code,
      });

      if (!emailResult.ok) {
        return json(502, { error: 'فشل إرسال البريد عبر Resend: ' + emailResult.error });
      }

      await pool.query('UPDATE orders SET email_sent=TRUE WHERE id=$1', [order.id]);
      return json(200, { ok: true, message: 'تم إرسال بريد التأكيد للعميل بنجاح.' });
    }

    return json(400, { error: 'إجراء غير معروف.' });
  }

  return json(405, { error: 'Method not allowed' });
};
