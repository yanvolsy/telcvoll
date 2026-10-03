const { db } = require('./_lib/db');
const { clientIp, json, hashPassword } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('reset_pw', 10, 900, ip);
    if (!allowed) return json(429, { error: 'محاولات متكررة كثيرة. يرجى الانتظار 15 دقيقة.' });
  } catch (err) {
    console.error('Rate limit unavailable:', err?.message);
    return json(503, { error: 'خدمة المصادقة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const token = String(body.token || '').trim();
  const password = String(body.password || '');
  const confirmPassword = String(body.confirm_password || body.password_confirm || '');

  if (!token) {
    return json(422, { error: 'رمز إعادة التعيين مفقود.' });
  }

  if (!password || password.length < 8) {
    return json(422, { error: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return json(422, { error: 'كلمتا المرور غير متطابقتين.' });
  }

  const pool = db();
  const client = await pool.connect();

  try {
    const studentRes = await client.query(
      `SELECT id, name, email, is_blocked
       FROM students
       WHERE reset_token = $1 AND reset_expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    const student = studentRes.rows[0];
    if (!student || student.is_blocked) {
      return json(400, {
        error: 'invalid_or_expired_token',
        message: 'رابط إعادة التعيين غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.',
      });
    }

    const passwordHash = await hashPassword(password);

    // Single-use: immediately invalidate reset_token
    await client.query(
      `UPDATE students
       SET password_hash = $1,
           reset_token = NULL,
           reset_expires_at = NULL,
           session_version = COALESCE(session_version, 0) + 1,
           updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, student.id]
    );

    return json(200, {
      ok: true,
      message: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return json(500, { error: 'حدث خطأ في الخادم أثناء إعادة تعيين كلمة المرور.' });
  } finally {
    client.release();
  }
};
