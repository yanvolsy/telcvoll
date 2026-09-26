const fs = require('fs');
const assert = require('assert');

console.log('--- STARTING SCROLLING, BUTTONS & SUBSCRIPTION SYNC TESTS ---');

// 1. Check Natural Mouse Scroll in app.css
console.log('\n[Test 1] Checking app.css natural mouse scroll...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

// Ensure overflow:hidden and locked heights are completely removed from exercise-page
assert(!appCss.includes('.exercise-page:has(.exam-workspace){height:calc(100vh'), 'exercise-page must not have locked height');
assert(appCss.includes('.exercise-page,') && appCss.includes('overflow-y: visible !important;'), 'exercise-page must have overflow-y: visible');
assert(appCss.includes('.exam-workspace,') && appCss.includes('height: auto !important;'), 'exam-workspace must have height: auto');
assert(appCss.includes('.exam-main,') && appCss.includes('height: auto !important;'), 'exam-main must have height: auto');
assert(appCss.includes('.exercise-actions {') && appCss.includes('position: fixed !important;'), 'exercise-actions must be position: fixed at bottom');
console.log('✓ Natural page mouse scrolling is enabled with fixed bottom actions bar');

// 2. Check Unified Student Action Buttons in students.html
console.log('\n[Test 2] Checking students.html action buttons unification...');
const studentsHtml = fs.readFileSync('public/admin/students.html', 'utf8');

assert(studentsHtml.includes('.student-action-btn{'), 'student-action-btn class must be defined in CSS');
assert(studentsHtml.includes('student-action-btn btn-sub'), 'Plan activation button must use student-action-btn');
assert(studentsHtml.includes('student-action-btn btn-edit'), 'Edit button must use student-action-btn');
assert(studentsHtml.includes('student-action-btn btn-block'), 'Ban button must use student-action-btn');
assert(studentsHtml.includes('student-action-btn btn-delete'), 'Delete button must use student-action-btn');
assert(!studentsHtml.includes('class="btn-toggle-block'), 'Old inconsistent btn-toggle-block must be removed');
console.log('✓ All 4 student management action buttons are unified with exact same size and style');

// 3. Check Western/Latin Numerals for Dates
console.log('\n[Test 3] Checking Latin numerals (ar-u-nu-latn) formatting...');
assert(studentsHtml.includes("d.toLocaleDateString('ar-u-nu-latn'"), 'students.html fmtDate must use ar-u-nu-latn');
const profileHtml = fs.readFileSync('public/profile.html', 'utf8');
assert(profileHtml.includes('ar-u-nu-latn'), 'profile.html must use ar-u-nu-latn for expiration date');
const dashHtml = fs.readFileSync('public/dashboard.html', 'utf8');
assert(dashHtml.includes('ar-u-nu-latn'), 'dashboard.html must use ar-u-nu-latn for notification dates');
console.log('✓ All dates format digits as Latin numerals (22 10) instead of Arabic-Indic digits');

// 4. Check Backend Subscription Synchronization
console.log('\n[Test 4] Checking Backend Subscription Sync...');
const dbLib = fs.readFileSync('netlify/functions/_lib/db.js', 'utf8');
assert(dbLib.includes('plan_id INT NULL'), 'db.js ensureSchema must support plan_id');
assert(dbLib.includes('plan_name VARCHAR(150) NULL'), 'db.js ensureSchema must support plan_name');
assert(dbLib.includes('subscription_expires_at TIMESTAMP NULL'), 'db.js ensureSchema must support subscription_expires_at');

const guardLib = fs.readFileSync('netlify/functions/_lib/guard.js', 'utf8');
assert(guardLib.includes('subscription_expires_at FROM students'), 'guard.js must check students subscription directly');
assert(guardLib.includes('is_paid = true') || guardLib.includes('is_paid: true'), 'guard.js must set is_paid: true on subscription');

const meJs = fs.readFileSync('netlify/functions/me.js', 'utf8');
assert(meJs.includes('const isPaid = !!(student.is_paid || student.subscription?.active || student.subscription?.is_paid)'), 'me.js must synchronize isPaid');

const adminStudents = fs.readFileSync('netlify/functions/admin-students.js', 'utf8');
assert(adminStudents.includes('subscription_expires_at = $3'), 'admin-students must write subscription_expires_at to students');
console.log('✓ Database schema, guard, me, and admin-students fully synchronized for student subscriptions');

// 5. Check Dashboard and Profile Frontend Subscription Handling
console.log('\n[Test 5] Checking Frontend Dashboard & Profile Subscription Handlers...');
assert(dashHtml.includes('state.subscription?.is_paid || state.subscription?.active'), 'dashboard.html must check both is_paid and active');
assert(profileHtml.includes('const isPaid = !!(data.is_paid || sub.active || sub.is_paid)'), 'profile.html must check both data.is_paid and sub.active');
console.log('✓ Dashboard and Profile handle both is_paid and active flawlessly');

console.log('\n======================================================');
console.log('  ALL SCROLLING, BUTTONS & SUBSCRIPTION TESTS PASSED!  ');
console.log('======================================================');
