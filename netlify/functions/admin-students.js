const { db, ensureSchema } = require('./_lib/db');
const { json, hashPassword } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();

  // Make sure all required columns exist in the database
  try {
    await ensureSchema(pool);
  } catch (schemaErr) {
    console.warn('[admin-students] ensureSchema notice:', schemaErr?.message);
  }

  if (event.httpMethod === 'GET') {
    let students = [];
    try {
      const res = await pool.query(
        `SELECT s.id, s.name,
                COALESCE(s.first_name, '') AS first_name,
                COALESCE(s.last_name, '') AS last_name,
                s.email,
                COALESCE(s.phone, '') AS phone,
                COALESCE(s.country, '') AS country,
                COALESCE(s.auth_provider, 'email') AS auth_provider,
                COALESCE(s.email_verified, FALSE) AS email_verified,
                COALESCE(s.is_blocked, FALSE) AS is_blocked,
                COALESCE(s.is_paid, FALSE) AS is_paid,
                s.created_at,
                s.last_login_at,
                COUNT(DISTINCT a.id)::int AS attempts,
                COALESCE(ROUND(AVG(a.percent), 1), 0) AS avg_score,
                sub.plan_name,
                sub.plan_id,
                sub.expires_at,
                CASE WHEN (COALESCE(s.is_paid, FALSE) = TRUE OR (sub.expires_at IS NOT NULL AND sub.expires_at > NOW())) THEN TRUE ELSE FALSE END AS is_subscription_active
         FROM students s
         LEFT JOIN attempts a ON a.student_id = s.id
         LEFT JOIN LATERAL (
           SELECT p.name AS plan_name, p.id AS plan_id, c.expires_at
           FROM access_codes c
           JOIN plans p ON p.id = c.plan_id
           WHERE c.student_id = s.id AND c.active = TRUE AND c.expires_at > NOW()
           ORDER BY c.expires_at DESC LIMIT 1
         ) sub ON TRUE
         GROUP BY s.id, sub.plan_name, sub.plan_id, sub.expires_at
         ORDER BY s.id DESC`
      );
      students = res.rows;
    } catch (queryErr) {
      console.warn('[admin-students] Primary query notice, falling back to simple query:', queryErr.message);
      try {
        const fallbackRes = await pool.query(
          `SELECT id, name, email,
                  COALESCE(phone, '') AS phone,
                  COALESCE(auth_provider, 'email') AS auth_provider,
                  COALESCE(is_blocked, FALSE) AS is_blocked,
                  COALESCE(is_paid, FALSE) AS is_paid,
                  created_at, last_login_at
           FROM students
           ORDER BY id DESC`
        );
        students = fallbackRes.rows.map(st => ({
          ...st,
          first_name: st.name || '',
          last_name: '',
          country: '',
          email_verified: false,
          attempts: 0,
          avg_score: 0,
          plan_name: null,
          plan_id: null,
          expires_at: null,
          is_subscription_active: !!st.is_paid
        }));
      } catch (fbErr) {
        console.error('[admin-students] Fallback query failed:', fbErr.message);
        students = [];
      }
    }

    let plans = [];
    try {
      const { rows } = await pool.query(
        `SELECT id, plan_key, name, duration_days, COALESCE(price_dzd, 0) AS price_dzd
         FROM plans
         WHERE active = TRUE
         ORDER BY duration_days ASC`
      );
      plans = rows;
    } catch (_) {
      try {
        const prFallback = await pool.query(
          `SELECT id, plan_key, name, duration_days FROM plans WHERE active = TRUE ORDER BY duration_days ASC`
        );
        plans = prFallback.rows.map(p => ({ ...p, price_dzd: 0 }));
      } catch (pErr) {
        console.warn('[admin-students] Plans query notice:', pErr.message);
        plans = [];
      }
    }

    return json(200, { students, plans });
  }

  if (event.httpMethod === 'PATCH') {
    if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
    if (!requestSize(event)) return json(413, { error: 'Request too large.' });

    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    const id = Number(body.id);
    if (!id) return json(422, { error: 'معرّف الطالب مطلوب.' });

    const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (!studentRes.rows.length) return json(404, { error: 'حساب الطالب غير موجود.' });
    const st = studentRes.rows[0];

    // 1. Toggle Block Status
    if (body.action === 'toggle_block' || (body.is_blocked !== undefined && !body.action)) {
      const isBlocked = body.is_blocked === true || body.is_blocked === 'true';
      await pool.query('UPDATE students SET is_blocked = $1, updated_at = NOW() WHERE id = $2', [isBlocked, id]);
      return json(200, { ok: true, is_blocked: isBlocked });
    }

    // 2. Edit Student Account Details (Name, Email, Phone, Password)
    if (body.action === 'update_student') {
      const name = body.name !== undefined ? String(body.name).trim() : st.name;
      const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : st.email;
      const phone = body.phone !== undefined ? String(body.phone).trim() : st.phone;

      if (!email) return json(422, { error: 'البريد الإلكتروني لا يمكن أن يكون فارغاً.' });

      if (email !== st.email) {
        const dup = await pool.query('SELECT id FROM students WHERE LOWER(email) = LOWER($1) AND id <> $2', [email, id]);
        if (dup.rows.length) return json(409, { error: 'هذا البريد الإلكتروني مسجل لحساب آخر بالفعل.' });
      }

      const newPass = body.new_password ? String(body.new_password).trim() : '';
      if (newPass) {
        if (newPass.length < 6) return json(422, { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' });
        const hash = await hashPassword(newPass);
        await pool.query(
          `UPDATE students
           SET name = $1, email = $2, phone = $3, password_hash = $4, updated_at = NOW()
           WHERE id = $5`,
          [name, email, phone, hash, id]
        );
      } else {
        await pool.query(
          `UPDATE students
           SET name = $1, email = $2, phone = $3, updated_at = NOW()
           WHERE id = $4`,
          [name, email, phone, id]
        );
      }

      return json(200, { ok: true, message: 'تم تحديث بيانات الطالب بنجاح' });
    }

    // 3. Set / Activate / Revoke Subscription by Plan
    if (body.action === 'set_subscription') {
      const isActive = body.is_active === true || body.is_active === 'true';

      if (!isActive) {
        // Revoke subscription -> set free
        try {
          await pool.query('UPDATE students SET is_paid = FALSE, updated_at = NOW() WHERE id = $1', [id]);
        } catch (_) {}
        try {
          await pool.query('UPDATE access_codes SET active = FALSE WHERE student_id = $1', [id]);
        } catch (_) {}
        try {
          await pool.query('UPDATE orders SET expires_at = NOW() WHERE student_id = $1 AND expires_at > NOW()', [id]);
        } catch (_) {}
        return json(200, { ok: true, is_paid: false, message: 'تم إلغاء الاشتراك وتحويل الحساب إلى مجاني' });
      }

      // Activate subscription
      const planId = Number(body.plan_id);
      let plan = null;
      if (planId) {
        const pr = await pool.query('SELECT * FROM plans WHERE id = $1', [planId]);
        if (pr.rows.length) plan = pr.rows[0];
      }
      if (!plan) {
        const pr = await pool.query('SELECT * FROM plans WHERE active = TRUE ORDER BY duration_days DESC LIMIT 1');
        if (pr.rows.length) plan = pr.rows[0];
      }
      if (!plan) {
        plan = { id: 1, name: 'B1-B2-C1 الكامل', duration_days: 30 };
      }

      let expiresAt;
      if (body.custom_expires_at) {
        expiresAt = new Date(body.custom_expires_at);
        if (isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
          return json(422, { error: 'تاريخ انتهاء الاشتراك المحدد غير صالح أو في الماضي.' });
        }
      } else {
        const days = Number(body.duration_days || plan.duration_days || 30);
        expiresAt = new Date(Date.now() + days * 86400000);
      }

      // 1. Generate active access code for this student
      const codeStr = 'ADM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      let codeId = null;
      try {
        const codeRes = await pool.query(
          `INSERT INTO access_codes(code, plan_id, student_id, active, expires_at)
           VALUES($1, $2, $3, TRUE, $4)
           RETURNING id`,
          [codeStr, plan.id, id, expiresAt]
        );
        codeId = codeRes.rows[0]?.id;
      } catch (err) {
        console.warn('access_codes insert error:', err.message);
      }

      // 2. Insert confirmed manual order record
      const orderId = 'ORD-ADM-' + Date.now();
      try {
        await pool.query(
          `INSERT INTO orders(
            order_id, plan_id, plan_name, customer_name, customer_email, customer_phone,
            amount, currency, payment_provider, status, access_code, code_id, student_id,
            paid_at, expires_at
          ) VALUES($1, $2, $3, $4, $5, $6, $7, 'DZD', 'manual_admin', 'CONFIRMED', $8, $9, $10, NOW(), $11)`,
          [
            orderId, plan.id, plan.name, st.name || 'طالب', st.email, st.phone || '',
            0, codeStr, codeId, id, expiresAt
          ]
        );
      } catch (err) {
        console.warn('orders insert error:', err.message);
      }

      // 3. Mark student as paid
      try {
        await pool.query('UPDATE students SET is_paid = TRUE, updated_at = NOW() WHERE id = $1', [id]);
      } catch (paidErr) {
        console.warn('students is_paid update notice:', paidErr.message);
      }

      return json(200, {
        ok: true,
        is_paid: true,
        plan_name: plan.name,
        expires_at: expiresAt.toISOString(),
        message: `تم تفعيل اشتراك (${plan.name}) بنجاح حتى ${expiresAt.toLocaleDateString('ar-EG')}`
      });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
