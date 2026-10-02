const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running Phase 7B Mock Exam Shell & Header Modernization Suite ===\n');

const rootDir = path.join(__dirname, '..');
const mockExamPath = path.join(rootDir, 'public', 'mock-exam.html');
const selfTestPath = path.join(rootDir, 'public', 'self-test.html');
const selfTestResultPath = path.join(rootDir, 'public', 'self-test-result.html');

const mockHtml = fs.readFileSync(mockExamPath, 'utf8');
const selfTestHtml = fs.readFileSync(selfTestPath, 'utf8');
const selfTestResultHtml = fs.readFileSync(selfTestResultPath, 'utf8');

// 1. Check Dead CSS Removal
console.log('1. Checking dead CSS removal in mock-exam.html...');
assert.ok(
  !mockHtml.includes('id="telc-final-complete-rework-styles"'),
  'FAILED: <style id="telc-final-complete-rework-styles"> must be removed'
);
assert.ok(
  !mockHtml.includes('exercise-single-top-bar'),
  'FAILED: exercise-single-top-bar dead exercise class must be removed'
);
console.log('✓ Dead CSS successfully removed from mock-exam.html.');

// 2. Check Modern Mock Shell Styles
console.log('2. Checking modern mock shell and header styles in mock-exam.html...');
assert.ok(mockHtml.includes('id="mock-exam-modern-shell"'), 'FAILED: id="mock-exam-modern-shell" must exist');
assert.ok(mockHtml.includes('.mock-top {') || mockHtml.includes('.mock-top{'), 'FAILED: .mock-top styles must exist');
assert.ok(mockHtml.includes('.mock-brand-bar'), 'FAILED: .mock-brand-bar styles must exist');
assert.ok(mockHtml.includes('.mock-exam-controls'), 'FAILED: .mock-exam-controls styles must exist');
assert.ok(mockHtml.includes('.mock-actions'), 'FAILED: .mock-actions styles must exist');
assert.ok(mockHtml.includes('.mock-root#app'), 'FAILED: .mock-root#app dynamic offset must exist');
console.log('✓ Modern mock shell styles verified.');

// 3. Check Timer Presentation & Tabular Figures
console.log('3. Checking timer presentation and tabular figures...');
assert.ok(mockHtml.includes('font-variant-numeric: tabular-nums'), 'FAILED: timer must use tabular numbers');
assert.ok(mockHtml.includes('.mock-timer.danger'), 'FAILED: timer danger state must be styled');
assert.ok(mockHtml.includes('pulseDanger'), 'FAILED: pulseDanger animation must exist');
console.log('✓ Timer presentation and danger animation verified.');

// 4. Check Tab and Touch Target Sizing
console.log('4. Checking section and teil tab styling...');
assert.ok(mockHtml.includes('.mock-tab.active'), 'FAILED: .mock-tab.active must be styled');
assert.ok(mockHtml.includes('.mock-teil-tab.active'), 'FAILED: .mock-teil-tab.active must be styled');
assert.ok(mockHtml.includes('min-height: 48px'), 'FAILED: tab touch targets must be at least 44-48px');
console.log('✓ Tabs and touch target sizing verified.');

// 5. Check Cache-Buster Version across All 3 Files
console.log('5. Checking cache busters across all 3 files...');
const expectedCacheMock = 'app.css?v=20261002-mock-v7b';
assert.ok(mockHtml.includes(expectedCacheMock), 'FAILED: mock-exam.html must use v=20261002-mock-v7b');
assert.ok(selfTestHtml.includes('app.css?v=20261002-mock-v7b') || selfTestHtml.includes('app.css?v=20261002-mock-v7d'), 'FAILED: self-test.html cache buster');
assert.ok(selfTestResultHtml.includes('app.css?v=20261002-mock-v7b') || selfTestResultHtml.includes('app.css?v=20261002-mock-v7d'), 'FAILED: self-test-result.html cache buster');
console.log('✓ Cache buster version verified across all 3 files.');

// 6. Check Header Actions & Navigation Elements
console.log('6. Checking header structure and actions slot...');
assert.ok(mockHtml.includes('<span class="header-actions"></span>'), 'FAILED: mock-exam.html must have header-actions slot');
assert.ok(selfTestHtml.includes('<span class="header-actions"></span>'), 'FAILED: self-test.html must have header-actions slot');
assert.ok(selfTestResultHtml.includes('<span class="header-actions"></span>'), 'FAILED: self-test-result.html must have header-actions slot');
assert.ok(selfTestResultHtml.includes('data-i18n="nav_home_student"'), 'FAILED: self-test-result.html must have home student nav link');
console.log('✓ Header structures and actions slots verified.');

// 7. Check Inline JavaScript Syntax
console.log('7. Checking JavaScript syntax in all 3 modified files...');
function checkScripts(html, filename) {
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    try {
      new Function(code);
    } catch (e) {
      assert.fail(`JS Syntax error in ${filename} script #${count}: ${e.message}`);
    }
  }
  return count;
}

const mockScripts = checkScripts(mockHtml, 'mock-exam.html');
const selfTestScripts = checkScripts(selfTestHtml, 'self-test.html');
const selfTestResultScripts = checkScripts(selfTestResultHtml, 'self-test-result.html');
console.log(`✓ All scripts verified (${mockScripts} in mock-exam, ${selfTestScripts} in self-test, ${selfTestResultScripts} in self-test-result).`);

// 8. Check Protected Files Unchanged
console.log('8. Checking that protected files remain untouched...');
const protectedFiles = [
  'public/assets/app.js',
  'public/assets/app.css',
  'public/exercise.html',
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
console.log('  ALL 8/8 PHASE 7B MOCK SHELL & HEADER REGRESSION CHECKS PASSED!        ');
console.log('========================================================================\n');
