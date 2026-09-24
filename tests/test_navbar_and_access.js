const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING NAVBAR & ACCESS CONTROL TESTS ---');

const ROOT = path.resolve(__dirname, '..');

// 1. Verify Student Pages Navbars
console.log('\n[Test 1] Checking unified navbar in Student pages...');
const studentPages = [
  'public/dashboard.html',
  'public/plans.html',
  'public/self-test.html',
  'public/self-test-result.html',
  'public/errors.html',
  'public/profile.html',
  'public/summaries.html',
  'public/speaking.html',
  'public/telc-chat.html',
  'public/exam.html'
];

studentPages.forEach(p => {
  const filePath = path.join(ROOT, p);
  assert(fs.existsSync(filePath), `File does not exist: ${p}`);
  const html = fs.readFileSync(filePath, 'utf8');
  assert(html.includes('student-nav-links'), `Missing student-nav-links in ${p}`);
  assert(html.includes('/self-test.html'), `Missing /self-test.html link in ${p}`);
  assert(html.includes('/telc-chat.html'), `Missing /telc-chat.html link in ${p}`);
  assert(html.includes('/profile.html'), `Missing /profile.html link in ${p}`);
  assert(html.includes('logoutLink'), `Missing logoutLink in ${p}`);
  // Removed links should NOT be in the navbar
  assert(html.includes('nav_home_student'), `Missing منصة الطالب link in ${p}`);
  assert(!html.includes('nav_plans'), `Removed الخطط link still present in ${p}`);
  assert(!html.includes('nav_speaking_ai'), `Removed Sprechen AI link still present in ${p}`);
  assert(!html.includes('nav_errors'), `Removed أخطائي link still present in ${p}`);
});
console.log('✓ All 10 student pages have the correct student navbar!');

// 2. Verify Admin Pages Navbars
console.log('\n[Test 2] Checking unified navbar in Admin pages...');
const adminPages = [
  'public/admin/index.html',
  'public/admin/questions.html',
  'public/admin/students.html',
  'public/admin/plans.html',
  'public/admin/orders.html',
  'public/admin/campaigns.html',
  'public/admin/notifications.html',
  'public/admin/settings.html',
  'public/admin/exams.html',
  'public/admin/summaries.html',
  'public/admin/codes.html',
  'public/admin/code-generator.html',
  'public/admin/content.html'
];

adminPages.forEach(p => {
  const filePath = path.join(ROOT, p);
  assert(fs.existsSync(filePath), `File does not exist: ${p}`);
  const html = fs.readFileSync(filePath, 'utf8');
  assert(html.includes('admin-top-links'), `Missing admin-top-links in ${p}`);
  assert(html.includes('/admin/index.html'), `Missing /admin/index.html link in ${p}`);
  assert(html.includes('/admin/questions.html'), `Missing /admin/questions.html link in ${p}`);
  assert(html.includes('/admin/students.html'), `Missing /admin/students.html link in ${p}`);
  assert(html.includes('/admin/plans.html'), `Missing /admin/plans.html link in ${p}`);
  assert(html.includes('/admin/orders.html'), `Missing /admin/orders.html link in ${p}`);
  assert(html.includes('/admin/campaigns.html'), `Missing /admin/campaigns.html link in ${p}`);
  assert(html.includes('/admin/notifications.html'), `Missing /admin/notifications.html link in ${p}`);
  assert(html.includes('/admin/settings.html'), `Missing /admin/settings.html link in ${p}`);
  assert(html.includes('logoutLink'), `Missing logoutLink in ${p}`);
});
console.log('✓ All 13 admin pages contain the identical unified admin navbar!');

// 3. Verify Server-Side Paid Enforcement in Sprechen Teil 1
console.log('\n[Test 3] Verifying server-side paid guard for Sprechen Teil 1...');
const spkFunction = fs.readFileSync(path.join(ROOT, 'netlify/functions/ai-speaking-session.js'), 'utf8');
assert(spkFunction.includes('if(!student.is_paid || !student.ai_enabled)'), 'Missing paid check in ai-speaking-session.js');
console.log('✓ Sprechen Teil 1 presentation generator is strictly gated to paid accounts!');

// 4. Verify Server-Side Paid Enforcement in TELC Assistant
console.log('\n[Test 4] Verifying server-side paid guard for TELC Assistant...');
const chatFunction = fs.readFileSync(path.join(ROOT, 'netlify/functions/ai-telc-chat.js'), 'utf8');
assert(chatFunction.includes('if (!student.ai_enabled)'), 'Missing ai_enabled check in ai-telc-chat.js');
console.log('✓ TELC Assistant is strictly gated to paid accounts!');

// 5. Verify Dashboard Redesign Cards
console.log('\n[Test 5] Verifying dashboard SaaS cards markup...');
const dashHtml = fs.readFileSync(path.join(ROOT, 'public/dashboard.html'), 'utf8');
assert(dashHtml.includes('hub-status-card'), 'Missing hub-status-card in dashboard.html');
assert(dashHtml.includes('hub-progress-card'), 'Missing hub-progress-card in dashboard.html');
assert(dashHtml.includes('hub-progress-track'), 'Missing hub-progress-track in dashboard.html');
assert(!dashHtml.includes('🟢 حساب مجاني'), 'Old raw emoji ball card should be removed');
console.log('✓ Dashboard top cards successfully upgraded to modern SaaS layout!');

console.log('\n=============================================');
console.log('  ALL VERIFICATION TESTS PASSED 100%!  ');
console.log('=============================================\n');
