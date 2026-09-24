const crypto = require('crypto');
const { db } = require('./_lib/db');
const { sign, setCookie, clientIp, json } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { sendVerificationEmail } = require('./_lib/email');

exports.handler = async (event) => {
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });

  const ip = clientIp(event);
  const pool = db();
  const client = await pool.connect();

  try {
    let token = '';
    let action = 'verify';
    let email = '';

    if (event.httpMethod === 'GET') {
      const q = event.queryStringParameters || {};
      token = String(q.token || '').trim();
      action = String(q.action || 'verify').trim();
      email = String(q.email || '').trim().toLowerCase();
    } else if (event.httpMethod === 'POST') {
      let body = {};
      try { body = JSON.parse(event.body || '{}'); } catch (_) {}
      token = String(body.token || '').trim();
      action = String(body.action || 'verify').trim();
      email = String(body.email || '').trim().toLowerCase();
    } else {
      return json(405, { error: 'Method not allowed' });
    }

    // Action: Resend verification email
    if (action === 'resend') {
      if (!email || !email.includes('@')) {
        return json(422, { error: 'يرجى إدخال بريد إلكتروني صالح.' });
      }

      const allowed = await rateLimit('verify_resend', 5, 900, ip);
      if (!allowed) {
        return json(429, { error: 'تم تجاوز عدد محاولات الإرسال. يرجى الانتظار 15 دقيقة.' });
      }

      const stRes = await client.query(
        'SELECT id, name, email, email_verified FROM students WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
        [email]
      );

      if (stRes.rows.length === 0) {
        // Return friendly message even if email not found to avoid account enumeration
        return json(200, {
          ok: true,
          message: 'إذا كان البريد مسجلاً لدينا، فستصلك رسالة رابط التفعيل في غضون لحظات.'
        });
      }

      const student = stRes.rows[0];
      if (student.email_verified) {
        return json(200, {
          ok: true,
          already_verified: true,
          message: 'حسابك مفعل ومؤكد بالفعل. يمكنك تسجيل الدخول مباشرة.'
        });
      }

      const newToken = crypto.randomBytes(32).toString('hex');
      await client.query(
        `UPDATE students
         SET verification_token = $1,
             verification_expires_at = NOW() + INTERVAL '24 hours',
             updated_at = NOW()
         WHERE id = $2`,
        [newToken, student.id]
      );

      const siteUrl = process.env.SITE_URL || 'https://telcvoll.de';
      const verificationUrl = `${siteUrl}/verify-email.html?token=${newToken}`;
      await sendVerificationEmail({ to: student.email, name: student.name, verificationUrl });

      return json(200, {
        ok: true,
        message: 'تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني بنجاح.'
      });
    }

    // Action: Verify email token
    if (!token) {
      return json(400, { error: 'token_missing', message: 'رمز التحقق مفقود.' });
    }

    const res = await client.query(
      `SELECT id, name, first_name, last_name, email, phone, email_verified
       FROM students
       WHERE verification_token = $1
         AND (verification_expires_at IS NULL OR verification_expires_at > NOW())
       LIMIT 1`,
      [token]
    );

    if (res.rows.length === 0) {
      return json(400, {
        ok: false,
        error: 'invalid_or_expired_token',
        message: 'رابط التفعيل غير صالح أو انتهت صلاحيته. يمكنك طلب رابط جديد أدناه.'
      });
    }

    const student = res.rows[0];

    // Activate student account
    await client.query(
      `UPDATE students
       SET email_verified = TRUE,
           verification_token = NULL,
           verification_expires_at = NULL,
           last_login_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [student.id]
    );

    // Issue session token so user is automatically logged in upon activation!
    const sessionToken = sign({
      student_id: student.id,
      email: student.email,
      name: student.name,
    });

    return json(200, {
      ok: true,
      verified: true,
      student: {
        id: student.id,
        name: student.name,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
        email_verified: true,
      },
      token: sessionToken,
      message: 'تم تأكيد بريدك الإلكتروني وتفعيل حسابك بنجاح! مرحباً بك في منصة TELC Voll.'
    }, {
      'Set-Cookie': setCookie('student_token', sessionToken, 60 * 60 * 24 * 30),
    });
  } catch (err) {
    console.error('[AUTH VERIFY EMAIL ERROR]', err);
    return json(500, { error: 'حدث خطأ أثناء تأكيد الحساب. يرجى المحاولة مرة أخرى.' });
  } finally {
    client.release();
  }
};
