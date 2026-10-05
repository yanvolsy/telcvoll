const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.join(__dirname, '..');

const reg = fs.readFileSync(path.join(root, 'netlify/functions/auth-register.js'), 'utf8');
const login = fs.readFileSync(path.join(root, 'netlify/functions/auth-login.js'), 'utf8');
const verify = fs.readFileSync(path.join(root, 'netlify/functions/auth-verify-email.js'), 'utf8');
const guard = fs.readFileSync(path.join(root, 'netlify/functions/_lib/guard.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public/assets/app.js'), 'utf8');
const db = fs.readFileSync(path.join(root, 'netlify/functions/_lib/db.js'), 'utf8');

assert(reg.includes('pending_password_hash'), 'Legacy registration must use pending_password_hash');
assert(reg.includes('email_verified = FALSE'), 'Legacy registration must reset verification state');
assert(!reg.includes("'Set-Cookie': setCookie('student_token'"), 'Registration must not issue an authenticated session');
assert(login.includes("email_not_verified"), 'Login must reject unverified email accounts');
assert(verify.includes('pending_password_hash'), 'Email verification must promote the pending password hash');
assert(verify.includes('requireSameOrigin(event)'), 'POST email verification must enforce same-origin');
assert(guard.includes('return {\n      student_id: studentId'), 'Guard source inspected');
assert(app.includes("key === 'f12'"), 'F12 deterrence must exist');
assert(app.includes("['i', 'j', 'c'].includes(key)"), 'DevTools shortcut deterrence must exist');
assert(app.includes("auth-logout"), 'DevTools detection must terminate the browser session');
assert(db.includes('pending_password_hash'), 'Runtime schema bootstrap must include pending_password_hash');
console.log('PASS: security hardening static checks');
