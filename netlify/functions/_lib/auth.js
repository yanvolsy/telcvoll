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
  return cookie.serialize(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

function clearCookie(name) {
  return cookie.serialize(name, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  });
}

function studentFromEvent(event) {
  const cookies = getCookies(event);
  return verify(cookies.student_token);
}

function adminFromEvent(event) {
  const cookies = getCookies(event);
  const payload = verify(cookies.admin_token);
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

module.exports = {
  sign, verify, getCookies, setCookie, clearCookie,
  studentFromEvent, adminFromEvent, clientIp, json,
};
