const crypto = require('crypto');
const { db } = require('./_lib/db');
const { clientIp, json } = require('./_lib/auth');
const { sendPasswordResetEmail } = require('./_lib/email');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('forgot_pw', 5, 900, ip);
    if (!allowed) return json(429, { error: 'طلبات استعادة كلمة المرور كثيرة. يرجى الانتظار 15 دقيقة.' });
  } catch (err) {
    console.warn('Rate limit non-fatal error:', err?.message);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const email = String(body.email || '').toLowerCase().trim();
  if (!email || !email.includes('@')) {
    return json(422, { error: 'يرجى إدخال بريد إلكتروني صالح.' });
  }

  const pool = db();
  const client = await pool.connect();

  try {
    const studentRes = await client.query(
      'SELECT id, name, email, is_blocked FROM students WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
      [email]
    );

    const student = studentRes.rows[0];

    // Uniform response to prevent email enumeration attacks
    const successMsg = 'إذا كان هذا البريد مسجلاً لدينا، فستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.';

    if (!student || student.is_blocked) {
      return json(200, { ok: true, message: successMsg });
    }

    // Cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresMinutes = 60;

    await client.query(
      `UPDATE students
       SET reset_token = $1,
           reset_expires_at = NOW() + ($2 || ' minutes')::interval,
           updated_at = NOW()
       WHERE id = $3`,
      [token, expiresMinutes, student.id]
    );

    const siteUrl = (process.env.SITE_URL || 'https://telcvoll.de').replace(/\/+$/, '');
    const resetUrl = `${siteUrl}/reset-password.html?token=${encodeURIComponent(token)}`;

    // Send email via existing Resend infrastructure
    await sendPasswordResetEmail({
      to: student.email,
      name: student.name,
      resetUrl,
      expiresMinutes,
    });

    return json(200, { ok: true, message: successMsg });
  } catch (err) {
    console.error('Forgot password error:', err);
    return json(500, { error: 'حدث خطأ في الخادم أثناء إرسال رابط الاستعادة.' });
  } finally {
    client.release();
  }
};
