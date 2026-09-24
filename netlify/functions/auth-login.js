const crypto = require('crypto');
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
    console.warn('Rate limit non-fatal error:', err?.message);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const legacyCode = String(body.code || '').trim();

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
                password_hash, auth_provider, is_blocked, profile_completed
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
        token,
      }, {
        'Set-Cookie': setCookie('student_token', token, 60 * 60 * 24 * 30),
      });
    }

    // ----------------------------------------------------
    // 2. Backward-Compatible Flow: Legacy Access Code Login
    // ----------------------------------------------------
    if (legacyCode) {
      let raw = legacyCode.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u00A0]/g, '');
      const clean = raw.toUpperCase().replace(/\s+/g, '').replace(/[–—−_]/g, '-');
      const withHyphen = clean.includes('-') ? clean : (clean.startsWith('TV') ? 'TV-' + clean.slice(2) : 'TV-' + clean);
      const withoutHyphen = clean.replace(/-/g, '');
      const pureSuffix = withoutHyphen.startsWith('TV') ? withoutHyphen.slice(2) : withoutHyphen;

      const { rows } = await client.query(
        `SELECT c.*, p.duration_days, p.ai_enabled
         FROM access_codes c JOIN plans p ON p.id=c.plan_id
         WHERE (
           UPPER(c.code) = $1
           OR UPPER(c.code) = $2
           OR REPLACE(REPLACE(UPPER(c.code),' ',''),'-','') = $3
           OR REPLACE(REPLACE(REPLACE(UPPER(c.code),'TV-',''),' ',''),'-','') = $4
         )
           AND c.active=TRUE AND c.expires_at>NOW()
         ORDER BY c.expires_at DESC LIMIT 1`,
        [clean, withHyphen, withoutHyphen, pureSuffix]
      );

      const c = rows[0];
      if (!c) {
        return json(401, { error: 'invalid_code', message: 'رمز الوصول غير صالح أو منتهي الصلاحية.' });
      }

      await client.query('BEGIN');
      let studentId = c.student_id;
      if (!studentId) {
        const s = await client.query("INSERT INTO students(name, auth_provider) VALUES('Student', 'legacy_code') RETURNING id");
        studentId = s.rows[0].id;
        await client.query('UPDATE access_codes SET student_id=$1 WHERE id=$2', [studentId, c.id]);
      }
      await client.query('UPDATE sessions SET active=FALSE WHERE code_id=$1', [c.id]);
      const sessionToken = crypto.randomBytes(32).toString('hex');
      await client.query(
        'INSERT INTO sessions(student_id,code_id,token) VALUES($1,$2,$3)',
        [studentId, c.id, sessionToken]
      );
      await client.query(
        'UPDATE access_codes SET session_token=$1, last_used_at=NOW() WHERE id=$2',
        [sessionToken, c.id]
      );
      await client.query('COMMIT');

      const sRes = await client.query('SELECT id, name, email, phone FROM students WHERE id=$1', [studentId]);
      const student = sRes.rows[0] || { id: studentId, name: 'Student' };

      const jwtToken = sign({
        student_id: studentId,
        code_id: c.id,
        email: student.email || '',
        name: student.name || 'Student',
      });

      return json(200, {
        ok: true,
        student,
        token: jwtToken,
        legacy_code: true,
      }, {
        'Set-Cookie': setCookie('student_token', jwtToken, 60 * 60 * 24 * 30),
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
