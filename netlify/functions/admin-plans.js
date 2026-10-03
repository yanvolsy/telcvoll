const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!await requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();
  try {
    if (event.httpMethod === 'GET') {
      const plansRes = await pool.query(`
        SELECT p.*,
               COUNT(o.id) FILTER (WHERE o.status='CONFIRMED')::int AS confirmed_order_count,
               COUNT(DISTINCT o.student_id) FILTER (WHERE o.status='CONFIRMED' AND o.expires_at > NOW())::int AS active_subscription_count
        FROM plans p
        LEFT JOIN orders o ON o.plan_id=p.id
        GROUP BY p.id
        ORDER BY p.duration_days ASC, p.id ASC
      `);
      const levels = ['B1', 'B2', 'C1'];
      return json(200, { plans: plansRes.rows, levels });
    }

    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
    const action = String(body.action || '');

    if (action === 'plan' || action === 'update-plan') {
      const planKey = String(body.plan_key || '').trim();
      const name = String(body.name || '').trim();
      const days = Math.max(1, parseInt(body.days || 1, 10));
      const attempts = Math.max(0, parseInt(body.attempts || 0, 10));
      const ai = !!body.ai;
      const priceDzd = Number(body.price_dzd);
      const isFeatured = body.is_featured === true || body.is_featured === 'true' || body.is_featured === 'on';

      if (!planKey || !name) return json(422, { error: 'اسم الخطة ومعرفها مطلوبان.' });
      if (!Number.isFinite(priceDzd) || priceDzd < 0) return json(422, { error: 'سعر الخطة غير صالح.' });

      if (action === 'update-plan') {
        const id = parseInt(body.id || 0, 10);
        if (!id) return json(422, { error: 'معرف الخطة غير صالح.' });
        await pool.query(
          `UPDATE plans
           SET plan_key=$1,name=$2,duration_days=$3,max_attempts=$4,ai_enabled=$5,price_dzd=$6,is_featured=$7
           WHERE id=$8`,
          [planKey, name, days, attempts, ai, priceDzd, isFeatured, id]
        );
        if (isFeatured) await pool.query('UPDATE plans SET is_featured=FALSE WHERE id<>$1', [id]);
        return json(200, { ok: true, is_featured: isFeatured });
      }

      if (isFeatured) await pool.query('UPDATE plans SET is_featured=FALSE');
      await pool.query(
        `INSERT INTO plans(plan_key,name,duration_days,max_attempts,ai_enabled,price_dzd,is_featured,active)
         VALUES($1,$2,$3,$4,$5,$6,$7,TRUE)`,
        [planKey, name, days, attempts, ai, priceDzd, isFeatured]
      );
      return json(200, { ok: true });
    }

    if (action === 'feature-plan') {
      const id = parseInt(body.id || 0, 10);
      if (!id) return json(422, { error: 'معرف الخطة غير صالح.' });
      const exists = await pool.query('SELECT id FROM plans WHERE id=$1 LIMIT 1', [id]);
      if (!exists.rows.length) return json(404, { error: 'الخطة غير موجودة.' });
      await pool.query('UPDATE plans SET is_featured=FALSE');
      await pool.query('UPDATE plans SET is_featured=TRUE WHERE id=$1', [id]);
      return json(200, { ok: true, is_featured: true });
    }

    if (action === 'toggle-plan') {
      const id = parseInt(body.id || 0, 10);
      if (!id) return json(422, { error: 'معرف الخطة غير صالح.' });
      await pool.query('UPDATE plans SET active=NOT active WHERE id=$1', [id]);
      return json(200, { ok: true });
    }

    return json(400, { error: 'Unknown action' });
  } catch (err) {
    console.error('[admin-plans]', err);
    return json(500, { error: 'تعذر حفظ إعدادات الخطة حالياً.' });
  }
};
