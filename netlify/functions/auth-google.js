const { db, ensureSchema } = require('./_lib/db');
const { sign, setCookie, clientIp, json, verifyGoogleIdToken, verifySupabaseToken } = require('./_lib/auth');
const { rateLimit } = require('./_lib/ratelimit');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = clientIp(event);
  try {
    const allowed = await rateLimit('google_auth', 30, 900, ip);
    if (!allowed) return json(429, { error: 'محاولات دخول متكررة كثيرة. يرجى الانتظار 15 دقيقة.' });
  } catch (err) {
    console.warn('Rate limit non-fatal error:', err?.message);
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const incomingToken = String(
    body.supabase_token ||
    body.access_token ||
    body.credential ||
    body.id_token ||
    body.token ||
    ''
  ).trim();

  if (!incomingToken) {
    return json(422, { error: 'رمز تعريف Google/Supabase مفقود.' });
  }

  // 1. Strict Server-Side Verification: Support both Supabase OAuth & Google GIS ID tokens
  let verifiedUser = null;
  if (body.supabase_token || body.access_token) {
    const sbRes = await verifySupabaseToken(incomingToken);
    if (sbRes.ok && sbRes.email) {
      verifiedUser = sbRes;
    } else {
      const gRes = await verifyGoogleIdToken(incomingToken);
      if (gRes.ok && gRes.email) verifiedUser = gRes;
      else return json(401, { error: 'invalid_token', message: sbRes.error || gRes.error || 'فشل التحقق من حساب Google.' });
    }
  } else {
    const gRes = await verifyGoogleIdToken(incomingToken);
    if (gRes.ok && gRes.email) {
      verifiedUser = gRes;
    } else {
      const sbRes = await verifySupabaseToken(incomingToken);
      if (sbRes.ok && sbRes.email) {
        verifiedUser = sbRes;
      } else {
        return json(401, { error: 'invalid_token', message: gRes.error || sbRes.error || 'فشل التحقق من حساب Google.' });
      }
    }
  }

  const pool = db();
  await ensureSchema(pool);
  const client = await pool.connect();

  try {
    const verifiedEmail = verifiedUser.email.toLowerCase().trim();
    const googleId = verifiedUser.sub;
    const fullName = String(verifiedUser.name || `${verifiedUser.first_name || ''} ${verifiedUser.last_name || ''}`).trim() || 'Student';
    const firstName = String(verifiedUser.first_name || '').trim();
    const lastName = String(verifiedUser.last_name || '').trim();

    // 2. Check if student already exists by verified email or google_id
    const existingRes = await client.query(
      `SELECT id, name, first_name, last_name, email, phone, is_blocked, profile_completed
       FROM students
       WHERE LOWER(TRIM(email)) = $1 OR google_id = $2
       LIMIT 1`,
      [verifiedEmail, googleId]
    );

    let student = existingRes.rows[0];

    if (student) {
      if (student.is_blocked) {
        return json(403, { error: 'account_blocked', message: 'تم إيقاف هذا الحساب. يرجى مراجعة إدارة المنصة.' });
      }

      // Update existing student with Google ID & login timestamp
      await client.query(
        `UPDATE students
         SET google_id = COALESCE(google_id, $1),
             auth_provider = CASE WHEN auth_provider IS NULL OR auth_provider='legacy_code' THEN 'google' ELSE auth_provider END,
             email_verified = TRUE,
             last_login_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [googleId, student.id]
      );
    } else {
      // 3. New student: create account automatically using verified Google identity
      const insertRes = await client.query(
        `INSERT INTO students(
           name, first_name, last_name, email,
           google_id, auth_provider, email_verified, profile_completed,
           created_at, updated_at, last_login_at
         ) VALUES ($1, $2, $3, $4, $5, 'google', TRUE, TRUE, NOW(), NOW(), NOW())
         RETURNING id, name, first_name, last_name, email, phone, profile_completed`,
        [fullName, firstName, lastName, verifiedEmail, googleId]
      );
      student = insertRes.rows[0];
    }

    // 4. Issue authenticated session token
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
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        phone: student.phone,
        profile_completed: student.profile_completed !== false,
      },
      token,
    }, {
      'Set-Cookie': setCookie('student_token', token, 60 * 60 * 24 * 30),
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return json(500, { error: 'حدث خطأ أثناء تسجيل الدخول بحساب Google.' });
  } finally {
    client.release();
  }
};
