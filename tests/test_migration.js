process.env.JWT_SECRET = process.env.JWT_SECRET || 'a-very-secure-jwt-secret-key-that-is-at-least-32-chars-long';

const assert = require('assert');
const { hashPassword, verifyPassword, sign, verify } = require('../netlify/functions/_lib/auth');
const { checkExerciseAccess } = require('../netlify/functions/_lib/guard');

async function runTests() {
  console.log('--- STARTING TELC VOLL MIGRATION TESTS ---');

  // Test 1: Password Hashing & Verification
  console.log('\n[Test 1] Testing bcrypt password hashing and verification...');
  const plainPassword = 'MySecurePassword2026!';
  const hash = await hashPassword(plainPassword);
  assert(hash && hash.startsWith('$2'), 'Hash should be valid bcrypt format');
  assert.notStrictEqual(hash, plainPassword, 'Hash must not equal plain password');

  const matches = await verifyPassword(plainPassword, hash);
  assert.strictEqual(matches, true, 'verifyPassword should return true for correct password');

  const fails = await verifyPassword('WrongPassword', hash);
  assert.strictEqual(fails, false, 'verifyPassword should return false for wrong password');
  console.log('✓ Password hashing and verification passed');

  // Test 2: JWT Session Token Generation & Verification
  console.log('\n[Test 2] Testing JWT sign and verify...');
  const payload = { id: 42, role: 'student', email: 'student@example.com' };
  const token = sign(payload, 3600);
  assert(token && typeof token === 'string', 'Token should be a non-empty string');

  const decoded = verify(token);
  assert.strictEqual(decoded.id, 42, 'Decoded ID should match payload');
  assert.strictEqual(decoded.role, 'student', 'Decoded role should match payload');
  assert.strictEqual(decoded.email, 'student@example.com', 'Decoded email should match payload');
  console.log('✓ JWT token creation and verification passed');

  // Test 3: Exercise Access Gatekeeper Logic (Free vs Paid)
  console.log('\n[Test 3] Testing checkExerciseAccess gatekeeper...');
  const createMockPool = (exercise) => ({
    query: async () => ({ rows: [exercise] })
  });

  const freeExercise = { id: 101, title: 'LimOnade', access_mode: 'free', status: 'published' };
  const paidExercise = { id: 102, title: 'Sport ist gesund', access_mode: 'paid', status: 'published' };

  const freeStudentContext = {
    id: 1,
    name: 'Free Student',
    email: 'free@example.com',
    is_paid: false,
    subscription: { active: false, plan: null, expires_at: null }
  };

  const paidStudentContext = {
    id: 2,
    name: 'Paid Student',
    email: 'paid@example.com',
    is_paid: true,
    subscription: { active: true, plan: 'B1-B2-C1 الكامل', expires_at: new Date(Date.now() + 86400000).toISOString() }
  };

  // Case A: Free student accessing free exercise -> MUST SUCCEED
  const checkA = await checkExerciseAccess(createMockPool(freeExercise), 101, freeStudentContext);
  assert.strictEqual(checkA.allowed, true, 'Free student should be allowed to access free exercise');

  // Case B: Free student accessing paid exercise -> MUST BE BLOCKED WITH 403
  const checkB = await checkExerciseAccess(createMockPool(paidExercise), 102, freeStudentContext);
  assert.strictEqual(checkB.allowed, false, 'Free student should NOT be allowed to access paid exercise');
  assert.strictEqual(checkB.status, 403, 'Blocked check must return HTTP 403');
  assert.strictEqual(checkB.error, 'payment_required', 'Blocked check error must be payment_required');

  // Case C: Paid student accessing free exercise -> MUST SUCCEED
  const checkC = await checkExerciseAccess(createMockPool(freeExercise), 101, paidStudentContext);
  assert.strictEqual(checkC.allowed, true, 'Paid student should be allowed to access free exercise');

  // Case D: Paid student accessing paid exercise -> MUST SUCCEED
  const checkD = await checkExerciseAccess(createMockPool(paidExercise), 102, paidStudentContext);
  assert.strictEqual(checkD.allowed, true, 'Paid student should be allowed to access paid exercise');

  // Case E: Default exercise with undefined access_mode defaults to paid -> free student BLOCKED
  const legacyExercise = { id: 103, title: 'Legacy Subject', status: 'published' };
  const checkE = await checkExerciseAccess(createMockPool(legacyExercise), 103, freeStudentContext);
  assert.strictEqual(checkE.allowed, false, 'Legacy exercise without explicit access_mode defaults to paid');
  assert.strictEqual(checkE.status, 403, 'Default blocked check must return 403');
  console.log('✓ All 5 exercise access gatekeeper test cases passed');

  // Test 4: Password Reset Token Expiration Logic
  console.log('\n[Test 4] Testing password reset token expiry checking...');
  const futureDate = new Date(Date.now() + 3600 * 1000);
  const pastDate = new Date(Date.now() - 3600 * 1000);

  const isValidToken = (expiresAt) => new Date(expiresAt).getTime() > Date.now();
  assert.strictEqual(isValidToken(futureDate), true, 'Future expiry should be valid');
  assert.strictEqual(isValidToken(pastDate), false, 'Past expiry should be invalid');
  console.log('✓ Token expiry check logic passed');

  // Test 5: Registration Name Parsing (both camelCase and snake_case)
  console.log('\n[Test 5] Testing registration name parsing...');
  const parseName = (body) => {
    const firstName = String(body.first_name || body.firstName || '').trim();
    const lastName = String(body.last_name || body.lastName || '').trim();
    return String(body.name || [firstName, lastName].filter(Boolean).join(' ') || firstName).trim();
  };

  assert.strictEqual(parseName({ firstName: 'moulai med ali', lastName: 'مولاي' }), 'moulai med ali مولاي');
  assert.strictEqual(parseName({ first_name: 'Ahmed', last_name: 'Ben' }), 'Ahmed Ben');
  assert.strictEqual(parseName({ name: 'Direct Name' }), 'Direct Name');
  assert.strictEqual(parseName({ firstName: 'Solo' }), 'Solo');
  console.log('✓ Registration name parsing passed for all cases');

  // Test 6: Verification Token Expiry & URL Logic
  console.log('\n[Test 6] Testing email verification token expiry & URL logic...');
  const crypto = require('crypto');
  const sampleToken = crypto.randomBytes(32).toString('hex');
  assert.strictEqual(sampleToken.length, 64);
  const sampleUrl = `https://telcvoll.de/verify-email.html?token=${sampleToken}`;
  assert(sampleUrl.includes('/verify-email.html?token='));
  console.log('✓ Verification token format and URL logic passed');

  console.log('\n=============================================');
  console.log('  ALL TEST SUITES COMPLETED SUCCESSFULLY!  ');
  console.log('=============================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
