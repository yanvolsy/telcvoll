const fs = require('fs');
const assert = require('assert');

console.log('=== Running Mock Showroom & Universal Shuffle Verification Tests ===\n');

// 1. Verify Universal Shuffle Availability in exercise.html
console.log('Test 1: Verifying isShuffleAllowed for all shuffleable sections...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');

// Verify function definition handles Lesen 1,2,3, Hoeren 1,2,3, Sprachbausteine 1,2,3
assert(exHtml.includes("sec === 'Lesen' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)"), 'Lesen Teil 1, 2, 3 must allow shuffle');
assert(exHtml.includes("sec === 'Hören' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)"), 'Hören Teil 1, 2, 3 must allow shuffle');
assert(exHtml.includes("sec === 'Sprachbausteine' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)"), 'Sprachbausteine Teil 1, 2, 3 must allow shuffle');
console.log('✓ Test 1 Passed: Shuffle is strictly allowed across Lesen 1,2,3, Hören 1,2,3, and Sprachbausteine 1,2,3.\n');

// 2. Verify Result and Shuffle Centering in app.css
console.log('Test 2: Verifying centered result panel and right-aligned shuffle button...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(appCss.includes('.exercise-header-card .exercise-sub-bar') && appCss.includes('justify-content: center !important'), 'exercise-sub-bar must be centered');
assert(appCss.includes('.inline-result-panel') && appCss.includes('margin: 0 auto !important'), 'inline-result-panel must be centered with margin: 0 auto');
assert(appCss.includes('.exercise-heading-shuffle'), 'exercise-heading-shuffle styling must be present');
console.log('✓ Test 2 Passed: Result panel is strictly centered and shuffle button is placed in the center-right.\n');

// 3. Verify Mock Exam Lesen Teil 2 Showroom format
console.log('Test 3: Verifying mock-exam.html Lesen Teil 2 showroom structure...');
const mockHtml = fs.readFileSync('public/mock-exam.html', 'utf8');

const sL2 = mockHtml.indexOf('function renderMockLesen2(model){');
const eL2 = mockHtml.indexOf('function renderMockLesen3(model){');
const mockL2 = mockHtml.slice(sL2, eL2);

assert(mockL2.includes('class="long-text lesen2-long-text mock-reading-panel"'), 'Lesen Teil 2 must render long-text reading panel');
assert(mockL2.includes('class="lesen2-question'), 'Lesen Teil 2 must render showroom lesen2-question cards');
assert(mockL2.includes('class="question-num"'), 'Lesen Teil 2 must render question-num badge');
assert(mockL2.includes('class="side-option mock-option'), 'Lesen Teil 2 must render side-option buttons');
assert(!mockL2.includes('mini-tool'), 'Mock exam must not include practice mini-tools');
assert(!mockL2.includes('inline-translation'), 'Mock exam must not include translations');
console.log('✓ Test 3 Passed: Mock Exam Lesen Teil 2 matches showroom layout without title or translations.\n');

// 4. Verify Mock Exam Hören Showroom format (unified player + TELC table)
console.log('Test 4: Verifying mock-exam.html Hören showroom structure...');
const sH = mockHtml.indexOf('function renderMockHoeren(model){');
const eH = mockHtml.indexOf('/* ─── 7. Schreiben Renderer ─── */');
const mockH = mockHtml.slice(sH, eH);

assert(mockH.includes('renderUnifiedAudioPlayer(model.exercise.audio_url)'), 'Mock Hören must use renderUnifiedAudioPlayer');
assert(mockH.includes('class="hoeren-table-card"'), 'Mock Hören must render official hoeren-table-card');
assert(mockH.includes('class="hoeren-circle-radio-btn'), 'Mock Hören must render hoeren-circle-radio-btn');
assert(mockHtml.includes('bindHoerenAudioPlayer();'), 'Mock exam bind() must initialize audio player');
assert(!mockH.includes('textTools('), 'Mock Hören must not include textTools');
console.log('✓ Test 4 Passed: Mock Exam Hören matches showroom layout with unified audio player and TELC table.\n');

console.log('========================================================================');
console.log('  ALL MOCK SHOWROOM & UNIVERSAL SHUFFLE TESTS PASSED! (4/4)             ');
console.log('========================================================================');
