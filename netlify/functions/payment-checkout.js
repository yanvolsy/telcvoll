const crypto = require('crypto');
const { db } = require('./_lib/db');
const { json, studentFromEvent } = require('./_lib/auth');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { getStudentSubscription } = require('./_lib/guard');
const {
  getClientIp,
  normalizeEmail,
  checkPaymentRateLimit,
  recordPaymentAttempt,
  safeLog
} = require('./_lib/security');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'طلب غير صالح.' }); }

  const authStudent = studentFromEvent(event);
  const authenticatedStudentId = authStudent?.student_id || null;

  const clientIp = getClientIp(event);
  const planId = parseInt(body.plan_id, 10);
  const name = String(body.name || authStudent?.name || '').trim();
  const email = normalizeEmail(body.email || authStudent?.email || '');
  const rawPhone = String(body.phone || authStudent?.phone || '').trim();
  const cleanPhone = rawPhone.replace(/[\s\-\(\)]/g, '');
  const termsAccepted = body.terms === true || body.terms === 'true' || body.terms === 1;


  // Strict server-side validation against direct API calls & malformed payloads
  if (!planId || planId <= 0) return json(422, { error: 'يرجى اختيار الخطة المطلوبة.' });
  if (!name || name.length < 2 || name.length > 100) return json(422, { error: 'يرجى إدخال الاسم الكامل بشكل صحيح.' });
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 190 || !emailRegex.test(email)) {
    return json(422, { error: 'يرجى إدخال بريد إلكتروني صحيح.' });
  }

  if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 25 || !/^\+?[0-9]+$/.test(cleanPhone)) {
    return json(422, { error: 'يرجى إدخال رقم هاتف صحيح.' });
  }

  if (!termsAccepted) {
    return json(422, { error: 'يجب الموافقة على شروط الاستخدام للمتابعة.' });
  }

  const pool = db();

  // 1. Enforce Rate Limiting & Fast Duplicate Prevention (IP & Email limits)
  const rateLimit = await checkPaymentRateLimit(pool, { ip: clientIp, email, planId });
  if (!rateLimit.allowed) {
    return json(rateLimit.status || 429, { error: rateLimit.message });
  }

  // 2. Fetch Plan strictly from Database (NEVER trust frontend amount or plan data)
  const planRes = await pool.query('SELECT * FROM plans WHERE id=$1 AND active=TRUE', [planId]);
  const plan = planRes.rows[0];
  if (!plan) return json(404, { error: 'الخطة المحددة غير موجودة أو معطلة.' });

  // 2b. Enforce Active Subscription Renewal Guard:
  // If student already has an active paid subscription, they can only renew during the last 3 days!
  let targetStudentId = authenticatedStudentId;
  if (!targetStudentId && email) {
    try {
      const sRes = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
      if (sRes.rows[0]) targetStudentId = sRes.rows[0].id;
    } catch (_) {}
  }

  if (targetStudentId) {
    const currentSub = await getStudentSubscription(pool, targetStudentId);
    if (currentSub && currentSub.active && currentSub.is_paid && currentSub.expires_at) {
      const expTime = new Date(currentSub.expires_at).getTime();
      const now = Date.now();
      const remainingDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      if (remainingDays > 3) {
        return json(400, {
          error: `لديك اشتراك نشط حالياً ينتهي بعد ${remainingDays} يوماً. يمكنك تجديد اشتراكك فقط خلال آخر 3 أيام من نهاية الخطة الحالية.`,
          code: 'ACTIVE_SUBSCRIPTION_RENEWAL_GUARD',
          remaining_days: remainingDays,
          can_renew: false
        });
      }
    }
  }

  if (!plan.duration_days || plan.duration_days <= 0) {
    return json(422, { error: 'مدة الخطة غير صالحة. يرجى التواصل مع الإدارة.' });
  }

  const isFree = plan.plan_key === 'trial' || plan.duration_days <= 2 ||
    (plan.name && (plan.name.toLowerCase().includes('trial') || plan.name.includes('مجاني') || plan.name.toLowerCase().includes('free'))) ||
    (plan.price_dzd !== null && Number(plan.price_dzd) === 0);

  if (isFree) {
    return json(400, {
      error: 'هذه الخطة تجريبية مجانية. يرجى مراسلة الإدارة عبر صفحة "تواصل معنا" للحصول على رمز الوصول المجاني دون الحاجة للدفع.'
    });
  }

  // Server-side price resolution — NEVER trust price from browser. body.amount is strictly ignored!
  let amount = Number(plan.price_dzd);
  if (!amount || isNaN(amount) || amount <= 0) {
    if (plan.duration_days <= 15) amount = 1500;
    else if (plan.duration_days <= 30) amount = 2500;
    else if (plan.duration_days <= 90) amount = 6000;
    else amount = 10000;
  }

  // Enforce payment amount boundaries (500 DZD <= amount <= 500,000 DZD)
  if (amount < 500 || amount > 500000) {
    return json(422, {
      error: 'مبلغ الدفع يجب أن يكون بين 500 و 500,000 دج. يرجى التحقق من إعدادات الخطة.'
    });
  }

  const apiKey = process.env.ONECLICK_API_KEY;
  if (!apiKey) {
    safeLog('CONFIG_ERROR', { error: 'ONECLICK_API_KEY not configured' });
    return json(500, { error: 'بوابة الدفع غير مهيأة على الخادم حالياً. يرجى التواصل مع الإدارة.' });
  }

  // Record payment attempt (advances IP & Email counters)
  await recordPaymentAttempt(pool, { ip: clientIp, email, planId });

  const rawBaseUrl = process.env.ONECLICK_API_BASE_URL || 'https://api.oneclickdz.com';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const siteUrl = (process.env.SITE_URL || 'https://telcvoll.de').replace(/\/+$/, '');

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const client = await pool.connect();
  try {
    // 3. Insert order record with PENDING status and client IP for audit trails
    await client.query(
      `INSERT INTO orders(order_id, plan_id, plan_name, customer_name, customer_email, customer_phone, amount, currency, status, ip_address, student_id)
       VALUES($1, $2, $3, $4, $5, $6, $7, 'DZD', 'PENDING', $8, $9)`,
      [orderId, plan.id, plan.name, name, email, cleanPhone, Math.round(amount), clientIp, authenticatedStudentId]
    );

    // 4. Prepare payload for gateway createLink
    const returnUrl = `${siteUrl}/payment-success?order_id=${encodeURIComponent(orderId)}`;

    const gatewayPayload = {
      productInfo: {
        title: `TELC Voll — ${plan.name}`,
        amount: Math.round(amount),
        description: `اشتراك TELC Voll كامل (${plan.duration_days} يوم) B1 + B2 + C1`
      },
      feeMode: 'NO_FEE',
      successMessage: 'تم الدفع بنجاح! كود اشتراكك في TELC Voll جاهز.',
      redirectUrl: returnUrl
    };

    safeLog('GATEWAY_REQUEST', { orderId, planId: plan.id, amount: Math.round(amount) });

    const gatewayRes = await fetch(`${baseUrl}/v3/ocpay/createLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': apiKey.trim()
      },
      body: JSON.stringify(gatewayPayload)
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));
    const paymentUrl = gatewayData.data?.paymentUrl || gatewayData.paymentUrl || gatewayData.url;
    const paymentRef = gatewayData.data?.paymentRef || gatewayData.paymentRef || gatewayData.ref || gatewayData.id;

    if (!gatewayRes.ok || !paymentUrl) {
      safeLog('GATEWAY_CREATE_LINK_FAILED', {
        orderId,
        httpStatus: gatewayRes.status,
        reason: gatewayData.message || gatewayData.error || 'Gateway returned empty paymentUrl'
      });
      await client.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE order_id=$2', ['FAILED', orderId]);
      // Return safe message without leaking gateway internals or secrets
      return json(502, { error: 'تعذر إنشاء رابط الدفع الإلكتروني حالياً. يرجى المحاولة لاحقاً.' });
    }

    // 5. Store paymentRef & paymentUrl in the order
    await client.query(
      `UPDATE orders
       SET payment_ref=$1, payment_url=$2, updated_at=NOW()
       WHERE order_id=$3`,
      [paymentRef, paymentUrl, orderId]
    );

    safeLog('ORDER_CREATED_SUCCESS', { orderId, paymentRef, planId: plan.id });

    let finalPaymentUrl = paymentUrl;
    try {
      const u = new URL(paymentUrl);
      if (name) { u.searchParams.set('name', name); u.searchParams.set('client_name', name); }
      if (cleanPhone) { u.searchParams.set('phone', cleanPhone); }
      finalPaymentUrl = u.toString();
    } catch (_) {}

    return json(200, {
      ok: true,
      order_id: orderId,
      payment_ref: paymentRef,
      payment_url: finalPaymentUrl
    });
  } catch (err) {
    safeLog('CHECKOUT_EXCEPTION', { orderId, error: err.message });
    // Shield internal errors: do NOT send err.message to client
    return json(500, { error: 'حدث خطأ غير متوقع أثناء معالجة عملية الدفع. يرجى المحاولة لاحقاً.' });
  } finally {
    client.release();
  }
};
