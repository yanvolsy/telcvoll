const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const login = read('public/login.html');
const register = read('public/register.html');
const index = read('public/index.html');
const app = read('public/assets/app.js');
const netlify = read('netlify.toml');
const config = read('netlify/functions/auth-config.js');
assert(login.includes('waitForGoogle()'), 'Login must wait for GIS.');
assert(register.includes('waitForGoogle()'), 'Register must wait for GIS.');
assert(app.includes('window.waitForGoogle'), 'Google loader missing.');
assert(config.includes('GOOGLE_CLIENT_ID'), 'Google config missing.');
assert(netlify.includes('https://accounts.google.com'), 'CSP must allow Google.');
assert(index.includes("location.replace('/dashboard.html')"), 'Authenticated root must route to dashboard.');
for (const file of ['dashboard.html','plans.html','self-test.html','self-test-result.html','errors.html','profile.html','summaries.html','speaking.html','telc-chat.html','exam.html']) {
  const html=read('public/'+file);
  assert(html.includes('nav_home_student'), `${file}: missing student platform link`);
  assert(html.includes('/dashboard.html'), `${file}: missing dashboard link`);
  assert(html.includes('/profile.html'), `${file}: missing account link`);
  assert(html.includes('logoutLink'), `${file}: missing logout`);
}
console.log('AUTH UI REGRESSION TESTS PASSED');
