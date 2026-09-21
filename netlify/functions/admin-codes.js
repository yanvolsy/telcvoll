const crypto = require('crypto');
const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

function cleanCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function makeCode() {
  // Short, easy-to-type activation code. Keep the plan/level independent.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += alphabet[crypto.randomInt(0, alphabet.length)];
  return `TV-${suffix}`;
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();

  try {
    if (event.httpMethod === 'POST') {
      let body;
      try { body = JSON.parse(event.body || '{}'); }
      catch { return json(400, { error: 'Bad request' }); }

      const action = String(body.action || '');

      // Create / update a plan.
      if (action === 'plan' || action === 'update-plan') {
        const planKey = String(body.plan_key || '').trim();
        const name = String(body.name || '').trim();
        const days = Math.max(1, parseInt(body.days || 1, 10));
        const attempts = Math.max(0, parseInt(body.attempts || 0, 10));
        const ai = !!body.ai;
        const priceDzd = Math.max(0, parseFloat(body.price_dzd || body.price || 0));

        if (!planKey || !name) return json(422, { error: 'اسم الخطة ومعرفها مطلوبان.' });

        if (action === 'update-plan') {
          const id = parseInt(body.id || 0, 10);
          if (!id) return json(422, { error: 'معرف الخطة غير صالح.' });

          await pool.query(
            `UPDATE plans
             SET plan_key=$1,name=$2,duration_days=$3,max_attempts=$4,ai_enabled=$5,price_dzd=$6
             WHERE id=$7`,
            [planKey, name, days, attempts, ai, priceDzd, id]
          );
          return json(200, { ok: true });
        }

        await pool.query(
          'INSERT INTO plans(plan_key,name,duration_days,max_attempts,ai_enabled,price_dzd) VALUES($1,$2,$3,$4,$5,$6)',
          [planKey, name, days, attempts, ai, priceDzd]
        );
        return json(200, { ok: true });
      }

      if (action === 'toggle-plan') {
        const id = parseInt(body.id || 0, 10);
        await pool.query('UPDATE plans SET active=NOT active WHERE id=$1', [id]);
        return json(200, { ok: true });
      }

      // Generate access codes.
      if (action === 'code') {
        const planId = parseInt(body.plan_id || 0, 10);
        const planRes = await pool.query('SELECT * FROM plans WHERE id=$1', [planId]);
        const plan = planRes.rows[0];
        if (!plan) return json(404, { error: 'Plan not found' });

        const count = Math.min(100, Math.max(1, parseInt(body.count || 1, 10)));
        const created = [];

        for (let i = 0; i < count; i++) {
          let code;
          for (;;) {
            code = makeCode();
            const exists = await pool.query('SELECT id FROM access_codes WHERE code=$1', [code]);
            if (!exists.rows[0]) break;
          }

          await pool.query(
            `INSERT INTO access_codes(code,plan_id,expires_at)
             VALUES($1,$2,NOW() + ($3 || ' days')::interval)`,
            [code, planId, plan.duration_days]
          );
          created.push(code);
        }

        return json(200, { ok: true, codes: created });
      }

      if (action === 'toggle-code') {
        const id = parseInt(body.id || 0, 10);
        await pool.query('UPDATE access_codes SET active=NOT active WHERE id=$1', [id]);
        return json(200, { ok: true });
      }

      // Delete code cleanly with linked sessions
      if (action === 'delete-code') {
        const id = parseInt(body.id || 0, 10);
        if (!id) return json(422, { error: 'معرف الرمز غير صالح.' });
        // Clean up linked sessions first to satisfy foreign key constraint
        await pool.query('DELETE FROM sessions WHERE code_id=$1', [id]);
        const delRes = await pool.query('DELETE FROM access_codes WHERE id=$1 RETURNING id', [id]);
        if (!delRes.rows.length) return json(404, { error: 'رمز الدخول غير موجود.' });
        return json(200, { ok: true, deleted: true });
      }

      // Extend code expiration and/or update plan without altering code string
      if (action === 'extend-code') {
        const id = parseInt(body.id || 0, 10);
        const days = parseInt(body.days || 0, 10);
        const planId = body.plan_id ? parseInt(body.plan_id, 10) : null;
        if (!id || days <= 0) return json(422, { error: 'معرف الرمز وعدد أيام التمديد مطلوبان.' });

        if (planId) {
          await pool.query(
            `UPDATE access_codes
             SET expires_at = GREATEST(expires_at, NOW()) + ($1 || ' days')::interval,
                 plan_id = $2,
                 active = TRUE
             WHERE id = $3`,
            [days, planId, id]
          );
        } else {
          await pool.query(
            `UPDATE access_codes
             SET expires_at = GREATEST(expires_at, NOW()) + ($1 || ' days')::interval,
                 active = TRUE
             WHERE id = $2`,
            [days, id]
          );
        }
        return json(200, { ok: true });
      }

      // Replace the code value without changing its plan or expiry.
      if (action === 'replace-code') {
        const id = parseInt(body.id || 0, 10);
        let newCode = cleanCode(body.code);

        if (!id || !newCode) return json(422, { error: 'الرمز الجديد مطلوب.' });

        const duplicate = await pool.query(
          'SELECT id FROM access_codes WHERE code=$1 AND id<>$2',
          [newCode, id]
        );
        if (duplicate.rows[0]) return json(409, { error: 'هذا الرمز مستخدم مسبقاً.' });

        await pool.query('UPDATE access_codes SET code=$1 WHERE id=$2', [newCode, id]);
        return json(200, { ok: true, code: newCode });
      }

      return json(400, { error: 'Unknown action' });
    }

    const plans = (await pool.query(
      `SELECT p.*,
              COUNT(c.id)::int AS code_count,
              COUNT(c.id) FILTER (WHERE c.active=TRUE AND c.expires_at > NOW())::int AS active_code_count
       FROM plans p
       LEFT JOIN access_codes c ON c.plan_id=p.id
       GROUP BY p.id
       ORDER BY p.active DESC, p.duration_days ASC, p.id ASC`
    )).rows;

    const codes = (await pool.query(
      `SELECT c.*, p.name AS plan_name, p.duration_days, p.active AS plan_active,
              s.name AS student_name
       FROM access_codes c
       JOIN plans p ON p.id=c.plan_id
       LEFT JOIN students s ON s.id=c.student_id
       ORDER BY c.id DESC
       LIMIT 500`
    )).rows;

    return json(200, { plans, codes });
  } catch (e) {
    console.error(e);
    return json(500, { error: e.code === '23505' ? 'المعرف أو الرمز موجود مسبقاً.' : 'حدث خطأ في العملية.' });
  }
};
