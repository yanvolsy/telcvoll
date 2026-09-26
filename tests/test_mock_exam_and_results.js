const assert = require('assert');
const fs = require('fs');

console.log('=== Running Mock Exam, Result Screen & Liquid Glass UI Tests ===\n');

// 1. Verify public/mock-exam.html
console.log('Test 1: Verifying public/mock-exam.html interactive features...');
const mockHtml = fs.readFileSync('public/mock-exam.html', 'utf8');

assert(mockHtml.includes('mock-inline-gap-select'), 'mock-exam.html must include mock-inline-gap-select for inline text selection');
assert(mockHtml.includes('renderMockSpb1'), 'mock-exam.html must include renderMockSpb1');
assert(mockHtml.includes('renderMockSpb2'), 'mock-exam.html must include renderMockSpb2');
assert(mockHtml.includes('renderMockLesen1'), 'mock-exam.html must include renderMockLesen1');
assert(mockHtml.includes('renderMockLesen2'), 'mock-exam.html must include renderMockLesen2');
assert(mockHtml.includes('renderMockLesen3'), 'mock-exam.html must include renderMockLesen3');
assert(mockHtml.includes('renderMockHoeren'), 'mock-exam.html must include renderMockHoeren');
assert(mockHtml.includes('btn-finish-mock'), 'mock-exam.html must include btn-finish-mock');
assert(mockHtml.includes('حفظ وإنهاء الامتحان وعرض النتيجة'), 'mock-exam.html must include Arabic finish button text');
assert(mockHtml.includes('Prüfung beenden und Ergebnis anzeigen'), 'mock-exam.html must include German finish button text');
assert(mockHtml.includes("addEventListener('langchange'"), 'mock-exam.html must listen to langchange');
assert(mockHtml.includes("${isFirst ? 'disabled' : ''}"), 'mock-exam.html must disable previous button on first task');
console.log('✓ Test 1 Passed: mock-exam.html has all required showroom templates, inline gap selects, and navigation logic.\n');

// 2. Verify public/self-test-result.html
console.log('Test 2: Verifying public/self-test-result.html official certificate & encouragement...');
const resultHtml = fs.readFileSync('public/self-test-result.html', 'utf8');

assert(resultHtml.includes('telc-cert-card'), 'self-test-result.html must include telc-cert-card');
assert(resultHtml.includes('telc-cert-table'), 'self-test-result.html must include telc-cert-table');
assert(resultHtml.includes('Schriftliche Prüfung'), 'self-test-result.html must include Schriftliche Prüfung');
assert(resultHtml.includes('/ 225 Punkte'), 'self-test-result.html must include / 225 Punkte');
assert(resultHtml.includes('Leseverstehen'), 'self-test-result.html must include Leseverstehen');
assert(resultHtml.includes('Sprachbausteine'), 'self-test-result.html must include Sprachbausteine');
assert(resultHtml.includes('Hörverstehen'), 'self-test-result.html must include Hörverstehen');
assert(resultHtml.includes('Schriftlicher Ausdruck'), 'self-test-result.html must include Schriftlicher Ausdruck');
assert(resultHtml.includes('formatGermanScore'), 'self-test-result.html must format German decimal scores with comma');
assert(resultHtml.includes('result-hero'), 'self-test-result.html must include result-hero');
assert(resultHtml.includes('محاولة قيّمة وممتازة'), 'self-test-result.html must include encouraging message for candidates');
console.log('✓ Test 2 Passed: self-test-result.html matches official TELC certificate structure and includes warm encouragement.\n');

// 3. Verify public/exercise.html & public/assets/app.css
console.log('Test 3: Verifying Liquid Glass, blurred title, and icon-only orange eye button...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(exHtml.includes('thema-blurred-text'), 'exercise.html must include thema-blurred-text');
assert(exHtml.includes('title-eye-btn'), 'exercise.html must include title-eye-btn');
assert(exHtml.includes('stroke="#f47b20"'), 'exercise.html must style eye svg in orange #f47b20');

assert(appCss.includes('.thema-blurred-text'), 'app.css must define .thema-blurred-text');
assert(appCss.includes('filter: blur'), 'app.css must use CSS blur for hidden title');
assert(appCss.includes('.title-eye-btn'), 'app.css must define .title-eye-btn');
assert(appCss.includes('backdrop-filter: blur(20px)'), 'app.css must include liquid glass backdrop-filter');
// 4. Verify Lesen Teil 3 vertical ads and heading selection above each ad
console.log('Test 4: Verifying Lesen Teil 3 vertical ads and heading select above each ad...');
assert(exHtml.includes('lesen3-ads-list'), 'exercise.html must include lesen3-ads-list for vertical ads display');
assert(exHtml.includes('data-ad-select'), 'exercise.html must include data-ad-select above each ad');
assert(exHtml.includes('lesen3-headings-overview'), 'exercise.html must include headings overview above ads');
assert(mockHtml.includes('data-mock-ad-select'), 'mock-exam.html must include data-mock-ad-select above each ad');
console.log('✓ Test 4 Passed: Lesen Teil 3 displays ads one under another with heading select above each ad.\n');

console.log('================================================================');
console.log('  ALL MOCK EXAM, RESULT SCREEN & LIQUID GLASS TESTS PASSED!     ');
console.log('================================================================');
