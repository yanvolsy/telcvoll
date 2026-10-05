const { db } = require('./_lib/db');
const { sign, setCookie, clientIp, json, verifyPassword } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('login', 30, 900, ip);
    if (!allowed) return json(429, { error: 'محاولات دخول متكررة كثيرة. يرجى الانتظار 15 دقيقة.' });
  } catch (err) {
    console.error('Rate limit unavailable:', err?.message);
    return json(503, { error: 'خدمة المصادقة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');

  const pool = db();
  const client = await pool.connect();

  try {
    // ----------------------------------------------------
    // 1. Primary Flow: Email + Password Authentication
    // ----------------------------------------------------
    if (email) {
      if (!password) {
        return json(422, { error: 'يرجى إدخال كلمة المرور.' });
      }

      const { rows } = await client.query(
        `SELECT id, name, first_name, last_name, email, phone, country,
                password_hash, auth_provider, email_verified, is_blocked, profile_completed
         FROM students
         WHERE LOWER(TRIM(email)) = $1
         LIMIT 1`,
        [email]
      );

      const student = rows[0];
      if (!student || !student.password_hash) {
        // Safe uniform error message
        return json(401, { error: 'invalid_credentials', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
      }

      if (student.is_blocked) {
        return json(403, { error: 'account_blocked', message: 'تم إيقاف هذا الحساب. يرجى مراجعة إدارة المنصة.' });
      }

      const passwordMatch = await verifyPassword(password, student.password_hash);
      if (!passwordMatch) {
        return json(401, { error: 'invalid_credentials', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
      }

      if (student.email_verified !== true) {
        return json(403, {
          error: 'email_not_verified',
          message: 'يرجى تأكيد بريدك الإلكتروني أولاً. افتح رسالة التفعيل أو اطلب رابطاً جديداً.'
        });
      }

      // Update last login timestamp
      await client.query('UPDATE students SET last_login_at = NOW() WHERE id = $1', [student.id]);

      const token = sign({
        student_id: student.id,
        email: student.email,
        name: student.name,
      });

      return json(200, {
        ok: true,
        student: {
          id: student.id,
          name: student.name,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          phone: student.phone,
          profile_completed: student.profile_completed !== false,
        },
      }, {
        'Set-Cookie': setCookie('student_token', token, 60 * 60 * 24 * 30),
      });
    }


    return json(422, { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور لتسجيل الدخول.' });
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('Login error:', e);
    return json(500, { error: 'حدث خطأ في الخادم أثناء تسجيل الدخول.' });
  } finally {
    client.release();
  }
};
