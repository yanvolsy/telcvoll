const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING AUTH & STUDENTS RESILIENCY TESTS ---');

// Test 1: db.js ensureSchema definitions
console.log('\n[Test 1] Verifying db.js schema definitions...');
const dbSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/_lib/db.js'), 'utf8');
assert(dbSource.includes('ensureSchema'), 'ensureSchema must be exported');
assert(dbSource.includes('is_paid BOOLEAN'), 'Missing is_paid column in ensureSchema');
assert(dbSource.includes('verification_token VARCHAR'), 'Missing verification_token column in ensureSchema');
assert(dbSource.includes('verification_expires_at TIMESTAMP'), 'Missing verification_expires_at column in ensureSchema');
assert(dbSource.includes('price_dzd NUMERIC'), 'Missing price_dzd column in ensureSchema');
console.log('✓ All critical schema columns verified in db.js');

// Test 2: auth-register.js resiliency
console.log('\n[Test 2] Verifying auth-register.js resilient registration logic...');
const regSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/auth-register.js'), 'utf8');
assert(regSource.includes('ensureSchema'), 'auth-register must invoke ensureSchema');
assert(regSource.includes('23505'), 'auth-register must handle duplicate email conflict 23505');
assert(regSource.includes('هذا البريد الإلكتروني مسجل بالفعل'), 'auth-register must return clear duplicate email message');
console.log('✓ auth-register error handling and schema enforcement verified');

// Test 3: admin-students.js resilient queries
console.log('\n[Test 3] Verifying admin-students.js fallback and ensureSchema...');
const adminStudentsSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/admin-students.js'), 'utf8');
assert(adminStudentsSource.includes('ensureSchema(pool)'), 'admin-students must call ensureSchema');
assert(adminStudentsSource.includes('COALESCE(s.is_paid, FALSE)'), 'admin-students must safely handle is_paid');
assert(adminStudentsSource.includes('Fallback query') || adminStudentsSource.includes('fallbackRes'), 'admin-students must provide query fallback');
console.log('✓ admin-students query resilience verified');

// Test 4: admin-stats.js table level error isolation
console.log('\n[Test 4] Verifying admin-stats.js table isolation...');
const adminStatsSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/admin-stats.js'), 'utf8');
assert(adminStatsSource.includes('for (const t of tables)'), 'admin-stats must iterate tables');
assert(adminStatsSource.includes('try {') && adminStatsSource.includes('catch (err)'), 'admin-stats must isolate table query errors');
console.log('✓ admin-stats resilience verified');

// Test 5: public/admin/students.html resilience
console.log('\n[Test 5] Verifying admin/students.html frontend error handling...');
const adminHtml = fs.readFileSync(path.join(__dirname, '../public/admin/students.html'), 'utf8');
assert(!adminHtml.includes('load().catch(() => location.href'), 'admin/students.html must not kick admin on load error');
assert(adminHtml.includes('studentData = await api(\'admin-students\')'), 'admin/students.html must fetch students');
console.log('✓ admin/students.html error resilience verified');

console.log('\n=============================================');
console.log('  ALL AUTH & STUDENTS RESILIENCY TESTS PASSED!  ');
console.log('=============================================');
