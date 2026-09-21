const crypto = require('crypto');
const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { sendAccessCodeEmail } = require('./_lib/email');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { safeLog } = require('./_lib/security');

function makeSecureAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const buf = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[buf[i] % chars.length];
  return `TV-${code}`;
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });

  const url = new URL(event.rawUrl || 'http://localhost' + (event.path || '/'), 'http://localhost');
  let paymentRef = url.searchParams.get('paymentRef') || url.searchParams.get('ref') || url.searchParams.get('payment_ref');
  let orderId = url.searchParams.get('order_id') || url.searchParams.get('order');

  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    paymentRef = paymentRef || body.paymentRef || body.payment_ref || body.ref;
    orderId = orderId || body.order_id || body.order;
  }

  if (!paymentRef && !orderId) {
    return json(400, { error: 'مرجع الدفع أو رقم الطلب مطلوب للتحقق.' });
  }

  const pool = db();
  const client = await pool.connect();

  try {
    // 1. Locate order in database
    const orderRes = await client.query(
      `SELECT o.*, p.duration_days, p.ai_enabled
       FROM orders o JOIN plans p ON p.id=o.plan_id
       WHERE (o.payment_ref=$1 AND $1 IS NOT NULL) OR (o.order_id=$2 AND $2 IS NOT NULL)`,
      [paymentRef || null, orderId || null]
    );

    const order = orderRes.rows[0];
    if (!order) {
      return json(404, { error: 'لم يتم العثور على الطلب المطلوب في النظام.' });
    }

    // 2. IDEMPOTENCY CHECK: If order was already confirmed, return existing result immediately!
    // Never create a duplicate code or extra subscription.
    if (order.status === 'CONFIRMED' && order.access_code) {
      safeLog('IDEMPOTENT_VERIFY_HIT', { orderId: order.order_id, paymentRef: order.payment_ref });
      return json(200, {
        ok: true,
        status: 'CONFIRMED',
        order_id: order.order_id,
        payment_ref: order.payment_ref,
        plan_name: order.plan_name,
        duration_days: order.duration_days,
        expires_at: order.expires_at,
        access_code: order.access_code,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        already_processed: true
      });
    }

    // 3. Payment gateway status check
    const apiKey = process.env.ONECLICK_API_KEY;
    if (!apiKey) {
      safeLog('CONFIG_ERROR', { error: 'ONECLICK_API_KEY not configured' });
      return json(500, { error: 'بوابة الدفع الإلكتروني غير مهيأة على الخادم.' });
    }

    const refToCheck = paymentRef || order.payment_ref;
    if (!refToCheck) {
      return json(400, { error: 'مرجع عملية الدفع غير مسجل لهذا الطلب.' });
    }

    const rawBaseUrl = process.env.ONECLICK_API_BASE_URL || 'https://api.oneclickdz.com';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');

    const checkRes = await fetch(`${baseUrl}/v3/ocpay/checkPayment/${encodeURIComponent(refToCheck)}`, {
      method: 'GET',
      headers: {
        'X-Access-Token': apiKey.trim(),
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });

    const checkData = await checkRes.json().catch(() => ({}));
    if (!checkRes.ok) {
      safeLog('PAYMENT_CHECK_GATEWAY_ERROR', {
        ref: refToCheck,
        status: checkRes.status,
        reason: checkData.message || checkData.error
      });
      // Safe response without leaking gateway internals
      return json(502, { error: 'تعذر التحقق من حالة الدفع الإلكتروني حالياً. يرجى المحاولة لاحقاً.' });
    }

    // Extract status string from response (handles { status: 'CONFIRMED' } or { data: { status: 'CONFIRMED' } })
    const rawStatus = checkData.status || checkData.data?.status || checkData.paymentStatus || '';
    const status = String(rawStatus).trim().toUpperCase();

    // 4. Access Code is ONLY created when gateway status is CONFIRMED
    if (status === 'CONFIRMED') {
      await client.query('BEGIN');

      // Double check inside locked transaction for concurrency safety (Idempotency)
      const lockRes = await client.query('SELECT status, access_code FROM orders WHERE id=$1 FOR UPDATE', [order.id]);
      if (lockRes.rows[0]?.status === 'CONFIRMED' && lockRes.rows[0]?.access_code) {
        await client.query('ROLLBACK');
        return json(200, {
          ok: true,
          status: 'CONFIRMED',
          order_id: order.order_id,
          access_code: lockRes.rows[0].access_code,
          plan_name: order.plan_name,
          duration_days: order.duration_days,
          already_processed: true
        });
      }

      // Generate cryptographically unique TELC Voll code (TV-XXXXXX)
      let code;
      for (;;) {
        code = makeSecureAccessCode();
        const exists = await client.query('SELECT id FROM access_codes WHERE code=$1', [code]);
        if (!exists.rows.length) break;
      }

      // Find or create student record
      let studentId = order.student_id;
      if (!studentId && order.customer_email) {
        const sMatch = await client.query('SELECT id FROM students WHERE LOWER(TRIM(email))=$1 ORDER BY id ASC LIMIT 1', [order.customer_email]);
        if (sMatch.rows[0]) {
          studentId = sMatch.rows[0].id;
        } else {
          const sNew = await client.query(
            `INSERT INTO students(name, email, phone)
             VALUES($1, $2, $3) RETURNING id`,
            [order.customer_name || 'Student', order.customer_email, order.customer_phone || null]
          );
          studentId = sNew.rows[0].id;
        }
      }

      // Calculate expiration interval based on plan duration
      const codeRes = await client.query(
        `INSERT INTO access_codes(code, plan_id, student_id, active, expires_at)
         VALUES($1, $2, $3, TRUE, NOW() + ($4 || ' days')::interval)
         RETURNING id, expires_at`,
        [code, order.plan_id, studentId, order.duration_days]
      );
      const codeRow = codeRes.rows[0];

      // Update order to CONFIRMED
      await client.query(
        `UPDATE orders
         SET status='CONFIRMED', access_code=$1, code_id=$2, student_id=$3,
             paid_at=NOW(), expires_at=$4, updated_at=NOW()
         WHERE id=$5`,
        [code, codeRow.id, studentId, codeRow.expires_at, order.id]
      );

      await client.query('COMMIT');

      safeLog('PAYMENT_CONFIRMED_SUCCESS', {
        orderId: order.order_id,
        paymentRef: order.payment_ref,
        planId: order.plan_id,
        durationDays: order.duration_days
      });

      // Send confirmation email through Resend (asynchronously, does not block return)
      try {
        const emailResult = await sendAccessCodeEmail({
          to: order.customer_email,
          name: order.customer_name,
          planName: order.plan_name,
          durationDays: order.duration_days,
          expiresAt: codeRow.expires_at,
          accessCode: code,
        });
        if (emailResult.ok) {
          await pool.query('UPDATE orders SET email_sent=TRUE WHERE id=$1', [order.id]);
        }
      } catch (emailErr) {
        safeLog('EMAIL_SEND_FAILED', { orderId: order.order_id, error: emailErr.message });
      }

      return json(200, {
        ok: true,
        status: 'CONFIRMED',
        order_id: order.order_id,
        payment_ref: order.payment_ref,
        plan_name: order.plan_name,
        duration_days: order.duration_days,
        expires_at: codeRow.expires_at,
        access_code: code,
        customer_name: order.customer_name,
        customer_email: order.customer_email
      });
    }

    if (status === 'PENDING') {
      safeLog('PAYMENT_CHECK_PENDING', { orderId: order.order_id, ref: refToCheck });
      return json(200, {
        ok: true,
        status: 'PENDING',
        order_id: order.order_id,
        payment_ref: order.payment_ref,
        message: 'عملية الدفع لا تزال قيد المعالجة من قبل البنك. يرجى الانتظار بضع لحظات.'
      });
    }

    // If FAILED, CANCELLED, or EXPIRED — NEVER create access code
    const finalFailStatus = status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
    await client.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2',
      [finalFailStatus, order.id]
    );

    safeLog('PAYMENT_CHECK_FAILED', { orderId: order.order_id, ref: refToCheck, status: finalFailStatus });

    return json(200, {
      ok: true,
      status: finalFailStatus,
      order_id: order.order_id,
      payment_ref: order.payment_ref,
      message: 'لم تكتمل عملية الدفع أو تم إلغاؤها من البنك.'
    });

  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    safeLog('VERIFY_EXCEPTION', { orderId, error: err.message });
    // Shield internal errors: do NOT send err.message to client
    return json(500, { error: 'حدث خطأ أثناء التحقق من الدفع. يرجى المحاولة لاحقاً.' });
  } finally {
    client.release();
  }
};
