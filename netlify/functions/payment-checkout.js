const crypto = require('crypto');
const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'طلب غير صالح.' }); }

  const planId = parseInt(body.plan_id, 10);
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const termsAccepted = !!body.terms;

  if (!planId) return json(422, { error: 'يرجى اختيار الخطة المطلوبة.' });
  if (!name || name.length < 2) return json(422, { error: 'يرجى إدخال الاسم الكامل.' });
  if (!email || !email.includes('@') || !email.includes('.')) return json(422, { error: 'يرجى إدخال بريد إلكتروني صحيح.' });
  if (!phone || phone.length < 6) return json(422, { error: 'يرجى إدخال رقم هاتف صحيح.' });
  if (!termsAccepted) return json(422, { error: 'يجب الموافقة على شروط الاستخدام للمتابعة.' });

  const pool = db();
  const planRes = await pool.query('SELECT * FROM plans WHERE id=$1 AND active=TRUE', [planId]);
  const plan = planRes.rows[0];
  if (!plan) return json(404, { error: 'الخطة المحددة غير موجودة أو معطلة.' });

  const isFree = plan.plan_key === 'trial' || plan.duration_days <= 2 || (plan.name && (plan.name.toLowerCase().includes('trial') || plan.name.includes('مجاني') || plan.name.toLowerCase().includes('free'))) || (plan.price_dzd !== null && Number(plan.price_dzd) === 0);
  if (isFree) {
    return json(400, { error: 'هذه الخطة تجريبية مجانية. يرجى مراسلة الإدارة عبر صفحة "تواصل معنا" للحصول على رمز الوصول المجاني دون الحاجة للدفع.' });
  }

  // Server-side price resolution — NEVER trust price from browser
  let amount = Number(plan.price_dzd);
  if (!amount || isNaN(amount) || amount <= 0) {
    // Fallback default pricing based on duration if not configured
    if (plan.duration_days <= 15) amount = 1500;
    else if (plan.duration_days <= 30) amount = 2500;
    else if (plan.duration_days <= 90) amount = 6000;
    else amount = 10000;
  }

  // Enforce minimum payment amount (500 DZD)
  if (amount < 500) {
    return json(422, {
      error: 'الحد الأدنى لمبلغ الدفع الإلكتروني هو 500 دج. يرجى التحقق من إعدادات الخطة.'
    });
  }

  const apiKey = process.env.ONECLICK_API_KEY;
  if (!apiKey) {
    console.error('Payment API key is not set in environment.');
    return json(500, { error: 'بوابة الدفع غير مهيأة على الخادم حالياً. يرجى التواصل مع الإدارة.' });
  }

  const rawBaseUrl = process.env.ONECLICK_API_BASE_URL || 'https://api.oneclickdz.com';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const siteUrl = (process.env.SITE_URL || 'https://telcvoll.de').replace(/\/+$/, '');

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const client = await pool.connect();
  try {
    // 1. Insert order record in database with PENDING status
    await client.query(
      `INSERT INTO orders(order_id, plan_id, plan_name, customer_name, customer_email, customer_phone, amount, currency, status)
       VALUES($1, $2, $3, $4, $5, $6, $7, 'DZD', 'PENDING')`,
      [orderId, plan.id, plan.name, name, email, phone, Math.round(amount)]
    );

    // 2. Prepare payload for gateway createLink
    const returnUrl = `${siteUrl}/payment-success`;

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

    const gatewayRes = await fetch(`${baseUrl}/v3/ocpay/createLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': apiKey.trim(),
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(gatewayPayload)
    });

    const gatewayData = await gatewayRes.json().catch(() => ({}));

    if (!gatewayRes.ok || (!gatewayData.paymentUrl && !gatewayData.url)) {
      const errMsg = gatewayData.message || gatewayData.error || `Payment gateway responded with status ${gatewayRes.status}`;
      console.error('[PAYMENT GATEWAY CREATE_LINK ERROR]', errMsg, gatewayData);
      await client.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE order_id=$2', ['FAILED', orderId]);
      return json(502, { error: 'تعذر إنشاء رابط الدفع الإلكتروني حالياً. يرجى المحاولة لاحقاً.', details: errMsg });
    }

    const paymentUrl = gatewayData.paymentUrl || gatewayData.url;
    const paymentRef = gatewayData.paymentRef || gatewayData.ref || gatewayData.id;

    // 3. Store paymentRef & paymentUrl in the order
    await client.query(
      `UPDATE orders
       SET payment_ref=$1, payment_url=$2, updated_at=NOW()
       WHERE order_id=$3`,
      [paymentRef, paymentUrl, orderId]
    );

    return json(200, {
      ok: true,
      order_id: orderId,
      payment_ref: paymentRef,
      payment_url: paymentUrl
    });
  } catch (err) {
    console.error('[CHECKOUT EXCEPTION]', err);
    return json(500, { error: 'حدث خطأ أثناء معالجة الطلب: ' + err.message });
  } finally {
    client.release();
  }
};
