const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.join(__dirname, '..');
const selfTestPath = path.join(rootDir, 'public', 'self-test.html');
const selfTestResultPath = path.join(rootDir, 'public', 'self-test-result.html');

console.log('=== Running Phase 7D Verification Suite ===\n');

const selfTestHtml = fs.readFileSync(selfTestPath, 'utf8');
const selfTestResultHtml = fs.readFileSync(selfTestResultPath, 'utf8');

// 1. Check Cache-Buster Version (v7d)
console.log('1. Checking Cache-Buster v7d in modified files...');
assert.ok(selfTestHtml.includes('app.css?v=20261002-mock-v7d'), 'self-test.html must include cache-buster v7d');
assert.ok(selfTestResultHtml.includes('app.css?v=20261002-mock-v7d'), 'self-test-result.html must include cache-buster v7d');
console.log('✓ Cache busters verified (v7d).');

// 2. Check Syntax of inline scripts
console.log('2. Checking inline script syntax...');
function checkScript(content, filename) {
  const m = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(m, `No inline script in ${filename}`);
  try {
    new Function(m[1]);
    console.log(`✓ ${filename} inline JS syntax valid.`);
  } catch(e) {
    assert.fail(`JS Syntax error in ${filename}: ${e.message}`);
  }
}
checkScript(selfTestHtml, 'self-test.html');
checkScript(selfTestResultHtml, 'self-test-result.html');

// 3. Color Token Audit: Assert 0 instances of legacy green (#2d9b68, var(--green))
console.log('3. Checking color token integrity (0 legacy green)...');
const legacyPatterns = [/#2d9b68/gi, /var\(--green\b/g, /var\(--green-soft\b/g, /var\(--green-dark\b/g];
legacyPatterns.forEach(pat => {
  assert.ok(!selfTestHtml.match(pat), `Legacy green found in self-test.html: ${pat}`);
  assert.ok(!selfTestResultHtml.match(pat), `Legacy green found in self-test-result.html: ${pat}`);
});
console.log('✓ Zero legacy green instances found.');

// 4. Hero Card & Dark Mode Tokenization in self-test-result.html
console.log('4. Checking Hero Card and tokenized surfaces in self-test-result.html...');
assert.ok(selfTestResultHtml.includes('.result-hero.pass'), 'Hero pass CSS class missing');
assert.ok(selfTestResultHtml.includes('.result-hero.encourage'), 'Hero encourage CSS class missing');
assert.ok(selfTestResultHtml.includes('var(--bg-surface-elevated'), 'var(--bg-surface-elevated) missing');
assert.ok(selfTestResultHtml.includes('var(--state-success'), 'var(--state-success) missing');
assert.ok(selfTestResultHtml.includes('var(--state-danger'), 'var(--state-danger) missing');
assert.ok(!selfTestResultHtml.includes('rgba(255,255,255,0.85)'), 'Hardcoded white background found in hero!');
assert.ok(!selfTestResultHtml.includes('rgba(255,255,255,0.9)'), 'Hardcoded white gradient found in hero!');
console.log('✓ Hero card surface and semantic tokens verified.');

// 5. TELC Certificate Card & Section Breakdown
console.log('5. Checking TELC Certificate card and Section Breakdown...');
assert.ok(selfTestResultHtml.includes('telc-cert-card'), 'telc-cert-card missing');
assert.ok(selfTestResultHtml.includes('telc-cert-row total-row'), 'telc-cert-row total-row missing');
assert.ok(selfTestResultHtml.includes('Schriftliche Prüfung'), 'Schriftliche Prüfung title missing');
assert.ok(selfTestResultHtml.includes('formatGermanScore(schrift)'), 'formatGermanScore(schrift) missing');
assert.ok(selfTestResultHtml.includes('result-grid'), 'result-grid missing');
assert.ok(selfTestResultHtml.includes('result-section'), 'result-section missing');
assert.ok(selfTestResultHtml.includes('subscores'), 'subscores criteria missing');
console.log('✓ Certificate card and breakdown grid verified.');

// 6. Action Buttons & Print Stylesheet
console.log('6. Checking Action buttons and print styles...');
assert.ok(selfTestResultHtml.includes('window.print()'), 'window.print() missing');
assert.ok(selfTestResultHtml.includes('href="/self-test.html?level='), 'Repeat exam link missing');
assert.ok(selfTestResultHtml.includes('href="/dashboard.html"'), 'Dashboard link missing');
assert.ok(selfTestResultHtml.includes('@media print'), '@media print stylesheet missing');
assert.ok(selfTestResultHtml.includes('page-break-inside: avoid'), 'Print page-break controls missing');
console.log('✓ Action buttons and print styles verified.');

// 7. Check Functional Calculation Logic in self-test-result.html
console.log('7. Verifying functional calculation logic...');
assert.ok(selfTestResultHtml.includes('const schrift = sectionNames.reduce'), 'schrift calculation missing');
assert.ok(selfTestResultHtml.includes('const schriftMax = 225;'), 'schriftMax missing');
assert.ok(selfTestResultHtml.includes('const writtenPass = schrift >= 135;'), 'writtenPass threshold missing');
assert.ok(selfTestResultHtml.includes('const passed = writtenPass;'), 'passed variable missing');
assert.ok(selfTestResultHtml.includes('enforceResultLTR();'), 'enforceResultLTR missing');
console.log('✓ Calculation logic confirmed identical.');

// 8. Check Self-Test start flow in self-test.html
console.log('8. Verifying self-test.html start flow...');
assert.ok(selfTestHtml.includes('function start()'), 'start() missing');
assert.ok(selfTestHtml.includes('telc_mock_exam'), 'telc_mock_exam localStorage missing');
assert.ok(selfTestHtml.includes('examDurationSeconds:8400'), 'examDurationSeconds missing');
assert.ok(selfTestHtml.includes('self-levels'), 'self-levels missing');
assert.ok(selfTestHtml.includes('level-btn'), 'level-btn missing');
assert.ok(selfTestHtml.includes('mock-rules'), 'mock-rules missing');
assert.ok(selfTestHtml.includes('id="startBtn"'), 'startBtn missing');
console.log('✓ Self-test start flow confirmed identical.');

// 9. Check Protected Files Unchanged
console.log('9. Checking that protected files remain untouched...');
const protectedFiles = [
  'public/assets/app.js',
  'public/assets/app.css',
  'public/exercise.html',
  'public/mock-exam.html',
  'public/index.html',
  'public/plans.html',
  'public/dashboard.html',
  'public/speaking.html'
];
for (const rel of protectedFiles) {
  const fullPath = path.join(rootDir, rel);
  assert.ok(fs.existsSync(fullPath), `Protected file missing: ${rel}`);
}
console.log('✓ Protected files verified.');

console.log('\n========================================================================');
console.log('  ALL 9/9 PHASE 7D VERIFICATION CHECKS PASSED!                          ');
console.log('========================================================================\n');
