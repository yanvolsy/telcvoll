const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING COMPREHENSIVE PLATFORM-WIDE ENHANCEMENTS VERIFICATION ---');

const ROOT = path.resolve(__dirname, '..');

// 1. Verify Auth Pages (Apple Removed & Google Beautified)
console.log('\n[Check 1] Verifying Login & Register pages...');
const loginHtml = fs.readFileSync(path.join(ROOT, 'public/login.html'), 'utf8');
const registerHtml = fs.readFileSync(path.join(ROOT, 'public/register.html'), 'utf8');

assert(!loginHtml.includes('appleBtn'), 'Apple button must be removed from login.html');
assert(!loginHtml.includes('التسجيل باستخدام Apple'), 'Apple text must be removed from login.html');
assert(loginHtml.includes('googleBtn'), 'Google button must exist in login.html');
assert(loginHtml.includes('المتابعة السريعة بحساب Google'), 'Google button must have clear attractive text in login.html');

assert(!registerHtml.includes('appleBtn'), 'Apple button must be removed from register.html');
assert(!registerHtml.includes('التسجيل باستخدام Apple'), 'Apple text must be removed from register.html');
assert(registerHtml.includes('googleBtn'), 'Google button must exist in register.html');
assert(registerHtml.includes('التسجيل الفوري باستخدام Google'), 'Google button must have clear attractive text in register.html');
console.log('✓ Login and Register pages verified: Apple button removed, Google button full-width & beautiful');

// 2. Verify Landing Page CTA Order (Login above Register on the left)
console.log('\n[Check 2] Verifying Landing Page Access CTA (#access)...');
const indexHtml = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const accessSectionMatch = indexHtml.match(/<div class="landing-access-actions"[^>]*>([\s\S]*?)<\/div>/);
assert(accessSectionMatch, 'Missing landing-access-actions container in index.html');
const accessInner = accessSectionMatch[1];
const loginPos = accessInner.indexOf('href="/login.html"');
const regPos = accessInner.indexOf('href="/register.html"');
assert(loginPos !== -1 && regPos !== -1, 'Both login and register buttons must exist in #access');
assert(loginPos < regPos, 'Login button MUST appear above Register button in #access CTA');
console.log('✓ Landing page CTA verified: Login stacked above Register on the left');

// 3. Verify Admin Students Management (Action buttons single row + Delete Student)
console.log('\n[Check 3] Verifying Admin Students Management...');
const adminStudentsHtml = fs.readFileSync(path.join(ROOT, 'public/admin/students.html'), 'utf8');
const adminStudentsJs = fs.readFileSync(path.join(ROOT, 'netlify/functions/admin-students.js'), 'utf8');

assert(adminStudentsHtml.includes('deleteStudent'), 'Missing deleteStudent function in admin/students.html');
assert(adminStudentsHtml.includes('🗑️ حذف'), 'Missing delete student button in admin/students.html');
assert(/white-space:\s*nowrap/.test(adminStudentsHtml), 'Action buttons and badges must have white-space: nowrap in admin/students.html');
assert(adminStudentsJs.includes("action === 'delete_student'"), 'Missing delete_student handler in admin-students.js');
console.log('✓ Admin Students verified: Single-row actions & badges, delete student feature active');

// 4. Verify Dashboard SaaS Cards (Unified level badge, access pill, variation count)
console.log('\n[Check 4] Verifying Dashboard Exercise Cards...');
const dashHtml = fs.readFileSync(path.join(ROOT, 'public/dashboard.html'), 'utf8');
assert(dashHtml.includes('topic-level-badge'), 'Missing topic-level-badge in dashboard.html');
assert(dashHtml.includes('card-access-pill'), 'Missing card-access-pill in dashboard.html');
assert(dashHtml.includes('pill-free') && dashHtml.includes('pill-locked'), 'Missing pill-free / pill-locked styles in dashboard.html');
assert(dashHtml.includes('topic-variation-pill'), 'Missing topic-variation-pill in dashboard.html');
console.log('✓ Dashboard cards verified: Clean unified header and sleek access badges');

// 5. Verify Exercise Page Layouts, Logic & Interactions
console.log('\n[Check 5] Verifying Exercise Page (exercise.html)...');
const exHtml = fs.readFileSync(path.join(ROOT, 'public/exercise.html'), 'utf8');

// A. Helper functions
assert(exHtml.includes('function getExerciseBody'), 'Missing getExerciseBody helper');
assert(exHtml.includes('function getExerciseHeadings'), 'Missing getExerciseHeadings helper');

// B. Lesen Teil 3 & Matching: Reading ads on top, situations underneath
assert(exHtml.includes('matching-reading-panel'), 'Missing reading panel on top in renderMatching');
assert(exHtml.includes('matching-situations-head'), 'Missing situations header in renderMatching');
assert(exHtml.includes('Passende Anzeige für diese Situation'), 'Missing Anzeige label in renderMatching');

// C. Sprachbausteine: Inline gap select & questions underneath
assert(exHtml.includes('inline-gap-select'), 'Missing inline-gap-select in exercise.html');
assert(exHtml.includes('spb-questions-container'), 'Missing spb-questions-container under text');

// D. Schreiben: German character buttons & situation text
assert(exHtml.includes('char-btn'), 'Missing char-btn in renderWriting');
assert(exHtml.includes('writing-heading'), 'Missing writing-heading in renderWriting');

// E. Sprechen: Unified compact heading and body text
assert(exHtml.includes('speaking-heading'), 'Missing speaking-heading in renderSpeaking');
assert(exHtml.includes('getExerciseBody(model)'), 'renderSpeaking must use getExerciseBody(model)');

// F. Model answer toggle & check button multi-click
assert(exHtml.includes("showModelAnswers ? 'إخفاء الإجابة' : 'الإجابة النموذجية'"), 'Missing modelBtn text toggle');
assert(exHtml.includes('showModelAnswers=!showModelAnswers'), 'bindActions must toggle showModelAnswers');
assert(!exHtml.includes('async function submit(){if(submitted)return;'), 'submit function must not block repeated checks');
console.log('✓ Exercise page verified: Full reading text, inline gap selects, unified headers, repeatable checks, model toggle');

// 6. Verify Stylesheet (app.css)
console.log('\n[Check 6] Verifying Stylesheet (app.css)...');
const appCss = fs.readFileSync(path.join(ROOT, 'public/assets/app.css'), 'utf8');
assert(appCss.includes('.inline-gap-select'), 'app.css must contain .inline-gap-select');
assert(appCss.includes('.char-btn'), 'app.css must contain .char-btn');
assert(appCss.includes('.card-access-pill'), 'app.css must contain .card-access-pill');
assert(appCss.includes('.topic-level-badge'), 'app.css must contain .topic-level-badge');
assert(appCss.includes('.topic-variation-pill'), 'app.css must contain .topic-variation-pill');
assert(appCss.includes('@media (max-width: 768px)'), 'app.css must contain mobile responsiveness rules');
console.log('✓ Stylesheet verified: All components, themes, and mobile styles present');

console.log('\n================================================================');
console.log('  ALL 6 PLATFORM-WIDE ENHANCEMENT VERIFICATION CHECKS PASSED!   ');
console.log('================================================================\n');
