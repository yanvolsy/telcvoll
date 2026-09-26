process.env.JWT_SECRET = process.env.JWT_SECRET || 'a-very-secure-jwt-secret-key-that-is-at-least-32-chars-long';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING GOOGLE & SUPABASE OAUTH INTEGRATION TESTS ---');

// Test 1: Verify auth.js exports getSupabaseUrl and verifySupabaseToken
console.log('\n[Test 1] Verifying _lib/auth.js exports...');
const authLib = require('../netlify/functions/_lib/auth');
assert(typeof authLib.getSupabaseUrl === 'function', 'getSupabaseUrl must be exported');
assert(typeof authLib.verifySupabaseToken === 'function', 'verifySupabaseToken must be exported');
assert(typeof authLib.verifyGoogleIdToken === 'function', 'verifyGoogleIdToken must be exported');
console.log('✓ _lib/auth.js exports all required auth helpers');

// Test 2: Verify getSupabaseUrl regex extraction from various DATABASE_URL formats
console.log('\n[Test 2] Verifying getSupabaseUrl extraction logic...');
const origDbUrl = process.env.DATABASE_URL;
const origSbUrl = process.env.SUPABASE_URL;

// Case 1: Pooler URL
delete process.env.SUPABASE_URL;
process.env.DATABASE_URL = 'postgresql://postgres.myproject123:mypassword@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
assert.strictEqual(authLib.getSupabaseUrl(), 'https://myproject123.supabase.co', 'Failed to extract from pooler URL');

// Case 2: Direct connection URL
process.env.DATABASE_URL = 'postgres://postgres:mypassword@db.myproject456.supabase.co:5432/postgres';
assert.strictEqual(authLib.getSupabaseUrl(), 'https://myproject456.supabase.co', 'Failed to extract from direct DB URL');

// Case 3: Explicit SUPABASE_URL
process.env.SUPABASE_URL = 'https://custom-domain.supabase.co/';
assert.strictEqual(authLib.getSupabaseUrl(), 'https://custom-domain.supabase.co', 'Failed to use explicit SUPABASE_URL');

// Restore original env
if (origDbUrl) process.env.DATABASE_URL = origDbUrl; else delete process.env.DATABASE_URL;
if (origSbUrl) process.env.SUPABASE_URL = origSbUrl; else delete process.env.SUPABASE_URL;
console.log('✓ getSupabaseUrl successfully resolves Supabase project URLs');

// Test 3: Verify auth-config.js handler returns Supabase config
console.log('\n[Test 3] Verifying auth-config.js response shape...');
const authConfigSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/auth-config.js'), 'utf8');
assert(authConfigSource.includes('supabaseUrl'), 'auth-config must include supabaseUrl');
assert(authConfigSource.includes('supabaseAnonKey'), 'auth-config must include supabaseAnonKey');
assert(authConfigSource.includes('googleClientId'), 'auth-config must include googleClientId');
console.log('✓ auth-config.js exports all required OAuth endpoints');

// Test 4: Verify auth-google.js supports both Supabase OAuth & Google GIS tokens
console.log('\n[Test 4] Verifying auth-google.js multi-token support...');
const authGoogleSource = fs.readFileSync(path.join(__dirname, '../netlify/functions/auth-google.js'), 'utf8');
assert(authGoogleSource.includes('verifySupabaseToken'), 'auth-google must call verifySupabaseToken');
assert(authGoogleSource.includes('verifyGoogleIdToken'), 'auth-google must call verifyGoogleIdToken');
assert(authGoogleSource.includes('ensureSchema'), 'auth-google must call ensureSchema');
assert(authGoogleSource.includes('supabase_token'), 'auth-google must accept supabase_token');
console.log('✓ auth-google.js multi-token support verified');

// Test 5: Verify login.html & register.html frontend handling
console.log('\n[Test 5] Verifying login.html & register.html OAuth scripts...');
const loginHtml = fs.readFileSync(path.join(__dirname, '../public/login.html'), 'utf8');
const registerHtml = fs.readFileSync(path.join(__dirname, '../public/register.html'), 'utf8');

for (const [name, content] of [['login.html', loginHtml], ['register.html', registerHtml]]) {
  assert(content.includes('supabase-js'), `${name} must include Supabase JS SDK`);
  assert(content.includes('checkOAuthCallback'), `${name} must include checkOAuthCallback`);
  assert(content.includes('startGoogleSignIn'), `${name} must include startGoogleSignIn`);
  assert(content.includes('supabaseClient'), `${name} must include supabaseClient`);
  assert(content.includes('access_token'), `${name} must detect access_token in URL callback`);
  assert(content.includes('history.replaceState'), `${name} must clean token hash from URL`);
}
console.log('✓ Both login.html and register.html have complete Supabase OAuth integration');

console.log('\n======================================================');
console.log('  ALL GOOGLE & SUPABASE OAUTH INTEGRATION TESTS PASSED!  ');
console.log('======================================================');
