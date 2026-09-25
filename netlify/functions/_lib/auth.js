const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured and at least 32 characters long.');
}

function sign(payload, expiresIn = '30d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function verify(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function getCookies(event) {
  const header = (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
  return cookie.parse(header);
}

function setCookie(name, value, maxAgeSeconds) {
  const isDev = process.env.NETLIFY_DEV === 'true' || process.env.NODE_ENV === 'development';
  return cookie.serialize(name, value, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'Lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

function clearCookie(name) {
  const isDev = process.env.NETLIFY_DEV === 'true' || process.env.NODE_ENV === 'development';
  return cookie.serialize(name, '', {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0,
  });
}

function studentFromEvent(event) {
  const cookies = getCookies(event);
  let token = cookies.student_token;
  if (!token) {
    const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7).trim();
  }
  return verify(token);
}

function adminFromEvent(event) {
  const cookies = getCookies(event);
  let token = cookies.admin_token;
  if (!token) {
    const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7).trim();
  }
  const payload = verify(token);
  return payload && payload.admin === true ? payload : null;
}

function clientIp(event) {
  const h = event.headers || {};
  return (h['x-forwarded-for'] || h['client-ip'] || '0.0.0.0').split(',')[0].trim();
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...extraHeaders
    },
    body: JSON.stringify(body),
  };
}

const bcrypt = require('bcryptjs');

async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  return bcrypt.hash(plainPassword, 10);
}

async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Server-side Google ID Token verification directly with Google's public tokeninfo API.
 * Never trusts client-reported email or identity without server validation.
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    return { ok: false, error: 'Google token is missing.' };
  }
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.email) {
      return { ok: false, error: data.error_description || data.error || 'Google token validation failed.' };
    }

    // If GOOGLE_CLIENT_ID is configured, verify the audience matches
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && data.aud && data.aud !== expectedClientId.trim()) {
      return { ok: false, error: 'Google token audience mismatch.' };
    }

    return {
      ok: true,
      sub: data.sub,
      email: String(data.email).toLowerCase().trim(),
      email_verified: data.email_verified === 'true' || data.email_verified === true,
      name: data.name || '',
      given_name: data.given_name || '',
      family_name: data.family_name || '',
      picture: data.picture || '',
    };
  } catch (err) {
    console.error('Google token verification error:', err);
    return { ok: false, error: 'Failed to contact Google identity server.' };
  }
}

/**
 * Resolve Supabase project URL from SUPABASE_URL or DATABASE_URL
 */
function getSupabaseUrl() {
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL.trim().replace(/\/+$/, '');
  }
  const dbUrl = process.env.DATABASE_URL || '';
  const poolerMatch = dbUrl.match(/postgres\.([a-z0-9_-]+):/i);
  if (poolerMatch && poolerMatch[1]) {
    return `https://${poolerMatch[1]}.supabase.co`;
  }
  const directMatch = dbUrl.match(/@(?:db\.)?([a-z0-9_-]+)\.supabase\.(?:co|com)/i);
  if (directMatch && directMatch[1]) {
    return `https://${directMatch[1]}.supabase.co`;
  }
  return '';
}

/**
 * Verify Supabase OAuth access token by querying Supabase Auth endpoint
 */
async function verifySupabaseToken(accessToken, optionalUrl, optionalKey) {
  if (!accessToken || typeof accessToken !== 'string') {
    return { ok: false, error: 'Supabase access token is missing.' };
  }
  const baseUrl = (optionalUrl || getSupabaseUrl() || '').replace(/\/+$/, '');
  if (!baseUrl) {
    return { ok: false, error: 'Supabase URL is not configured.' };
  }

  const anonKey = optionalKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
  const headers = {
    'Authorization': `Bearer ${accessToken.trim()}`,
    'Accept': 'application/json',
  };
  if (anonKey) {
    headers['apikey'] = anonKey.trim();
  }

  try {
    const res = await fetch(`${baseUrl}/auth/v1/user`, {
      method: 'GET',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.email) {
      return {
        ok: false,
        error: data.msg || data.message || data.error_description || 'فشل التحقق من حساب Supabase/Google.'
      };
    }

    const meta = data.user_metadata || {};
    const identityData = (data.identities && data.identities[0] && data.identities[0].identity_data) || {};
    const email = String(data.email || meta.email || identityData.email || '').toLowerCase().trim();
    const fullName = String(meta.full_name || meta.name || identityData.name || identityData.full_name || '').trim();
    const parts = fullName ? fullName.split(' ') : [];
    const firstName = meta.first_name || (parts.length > 0 ? parts[0] : '');
    const lastName = meta.last_name || (parts.length > 1 ? parts.slice(1).join(' ') : '');

    return {
      ok: true,
      sub: data.id,
      email,
      name: fullName || [firstName, lastName].filter(Boolean).join(' ') || 'Student',
      first_name: firstName,
      last_name: lastName,
      provider: data.app_metadata?.provider || 'google',
    };
  } catch (err) {
    console.error('Supabase token verification error:', err);
    return { ok: false, error: 'تعذر الاتصال بخادم المصادقة.' };
  }
}

module.exports = {
  sign, verify, getCookies, setCookie, clearCookie,
  studentFromEvent, adminFromEvent, clientIp, json,
  hashPassword, verifyPassword, verifyGoogleIdToken,
  getSupabaseUrl, verifySupabaseToken,
};

