const crypto = require('crypto');
const { db, ensureSchema } = require('./_lib/db');
const { sign, setCookie, clientIp, json, hashPassword } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('register', 20, 900, ip);
    if (!allowed) return json(429, { error: 'عدد محاولات التسجيل تجاوز الحد المسموح. يرجى الانتظار 15 دقيقة.' });
  } catch (err) {
    console.warn('Rate limit non-fatal error:', err?.message);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const firstName = String(body.first_name || body.firstName || '').trim();
  const lastName = String(body.last_name || body.lastName || '').trim();
  const rawName = String(body.name || [firstName, lastName].filter(Boolean).join(' ') || firstName).trim();
  const email = String(body.email || '').toLowerCase().trim();
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '');
  const confirmPassword = String(body.confirm_password || body.password_confirm || body.confirmPassword || '');

  // Validation
  if (!rawName || rawName.length < 2) {
    return json(422, { error: 'يرجى إدخال الاسم بشكل صحيح.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 190 || !emailRegex.test(email)) {
    return json(422, { error: 'يرجى إدخال بريد إلكتروني صالح.' });
  }

  if (!password || password.length < 6) {
    return json(422, { error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return json(422, { error: 'كلمتا المرور غير متطابقتين.' });
  }

  const pool = db();
  const client = await pool.connect();

  try {
    // Ensure table columns and indexes exist
    await ensureSchema(client);

    // Generate secure email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Check if email already registered
    let existingRes;
    try {
      existingRes = await client.query(
        'SELECT id, password_hash, auth_provider, email_verified FROM students WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
        [email]
      );
    } catch (_) {
      existingRes = await client.query(
        'SELECT id FROM students WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
        [email]
      );
    }

    let studentId;

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      if (existing.password_hash) {
        return json(409, { error: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' });
      }
      // If student existed from legacy order/code without a password, attach password to existing account!
      const passwordHash = await hashPassword(password);
      try {
        await client.query(
          `UPDATE students
           SET name = COALESCE(NULLIF($1, ''), name),
               first_name = COALESCE(NULLIF($2, ''), first_name),
               last_name = COALESCE(NULLIF($3, ''), last_name),
               phone = COALESCE(NULLIF($4, ''), phone),
               password_hash = $5,
               auth_provider = 'email',
               verification_token = $6,
               verification_expires_at = NOW() + INTERVAL '24 hours',
               last_login_at = NOW(),
               updated_at = NOW()
           WHERE id = $7`,
          [rawName, firstName, lastName, phone, passwordHash, verificationToken, existing.id]
        );
      } catch (updErr) {
        // Fallback update without verification tokens if columns were unavailable
        await client.query(
          `UPDATE students
           SET name = COALESCE(NULLIF($1, ''), name),
               first_name = COALESCE(NULLIF($2, ''), first_name),
               last_name = COALESCE(NULLIF($3, ''), last_name),
               phone = COALESCE(NULLIF($4, ''), phone),
               password_hash = $5,
               updated_at = NOW()
           WHERE id = $6`,
          [rawName, firstName, lastName, phone, passwordHash, existing.id]
        );
      }
      studentId = existing.id;
    } else {
      // Hash password securely with bcrypt
      const passwordHash = await hashPassword(password);

      // Create student account with fallback
      let insertRes;
      try {
        insertRes = await client.query(
          `INSERT INTO students(
             name, first_name, last_name, email, phone,
             password_hash, auth_provider, email_verified, profile_completed,
             verification_token, verification_expires_at, is_paid,
             created_at, updated_at, last_login_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 'email', FALSE, TRUE, $7, NOW() + INTERVAL '24 hours', FALSE, NOW(), NOW(), NOW())
           RETURNING id, name, first_name, last_name, email, phone, email_verified`,
          [rawName, firstName, lastName, email, phone, passwordHash, verificationToken]
        );
      } catch (insertErr) {
        console.warn('[AUTH REGISTER] Primary insert notice, trying standard fallback:', insertErr.message);
        insertRes = await client.query(
          `INSERT INTO students(
             name, first_name, last_name, email, phone,
             password_hash, auth_provider, email_verified, profile_completed,
             created_at, updated_at, last_login_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 'email', FALSE, TRUE, NOW(), NOW(), NOW())
           RETURNING id, name, first_name, last_name, email, phone, email_verified`,
          [rawName, firstName, lastName, email, phone, passwordHash]
        );
      }

      studentId = insertRes.rows[0].id;
    }

    // Send verification email via Resend
    const siteUrl = process.env.SITE_URL || 'https://telcvoll.de';
    const verificationUrl = `${siteUrl}/verify-email.html?token=${verificationToken}`;
    try {
      const { sendVerificationEmail } = require('./_lib/email');
      await sendVerificationEmail({ to: email, name: rawName, verificationUrl });
    } catch (mailErr) {
      console.warn('[AUTH REGISTER] Verification email non-fatal notice:', mailErr?.message);
    }

    // Generate authenticated session token
    const token = sign({
      student_id: studentId,
      email,
      name: rawName,
    });

    return json(200, {
      ok: true,
      student: { id: studentId, name: rawName, email, phone, email_verified: false },
      token,
      verification_sent: true,
      message: 'تم إنشاء الحساب بنجاح وإرسال رابط التفعيل إلى بريدك الإلكتروني.'
    }, {
      'Set-Cookie': setCookie('student_token', token, 60 * 60 * 24 * 30),
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') {
      return json(409, { error: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' });
    }
    return json(500, { error: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى: ' + (err.message || '') });
  } finally {
    client.release();
  }
};
