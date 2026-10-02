const fs = require('fs');
const assert = require('assert');

const mockHtml = fs.readFileSync('public/mock-exam.html', 'utf8');

console.log('=== Running Phase 7C Mock Exam Question Workspace Verification ===\n');

// 1. Lesen Teil 1
console.log('1. Checking Lesen Teil 1 modernization...');
assert(mockHtml.includes('class="mock-item mock-l1-item'), 'Lesen 1 item missing');
assert(mockHtml.includes('class="mock-headings-bank"'), 'Lesen 1 headings bank missing');
assert(mockHtml.includes('data-answer-q="${esc(n)}"'), 'Lesen 1 select data attribute missing');
assert(mockHtml.includes('renderMockLesen1'), 'renderMockLesen1 missing');
console.log('✓ Lesen Teil 1 modernization verified.');

// 2. Lesen Teil 2
console.log('2. Checking Lesen Teil 2 modernization...');
assert(mockHtml.includes('class="long-text lesen2-long-text mock-reading-panel"'), 'Lesen 2 reading panel missing');
assert(mockHtml.includes('class="lesen2-question'), 'Lesen 2 question class missing');
assert(mockHtml.includes('class="side-option mock-option'), 'Lesen 2 mock-option missing');
assert(mockHtml.includes('renderMockLesen2'), 'renderMockLesen2 missing');
console.log('✓ Lesen Teil 2 modernization verified.');

// 3. Lesen Teil 3
console.log('3. Checking Lesen Teil 3 modernization...');
assert(mockHtml.includes('class="mock-item mock-l3-item'), 'Lesen 3 situation item missing');
assert(mockHtml.includes('class="mock-heading-item lesen3-ad-card'), 'Lesen 3 ad card missing');
assert(mockHtml.includes('data-mock-ad-select'), 'Lesen 3 ad select missing');
assert(mockHtml.includes('renderMockLesen3'), 'renderMockLesen3 missing');
console.log('✓ Lesen Teil 3 modernization verified.');

// 4. Hören 1, 2, 3
console.log('4. Checking Hören modernization and unified player...');
assert(mockHtml.includes('renderUnifiedAudioPlayer'), 'renderUnifiedAudioPlayer missing');
assert(mockHtml.includes('bindHoerenAudioPlayer'), 'bindHoerenAudioPlayer missing');
assert(mockHtml.includes('hoeren-table-card'), 'Hören table card missing');
assert(mockHtml.includes('hoeren-circle-radio-btn'), 'Hören circle radio button missing');
assert(mockHtml.includes('data-answer="richtig"'), 'Hören richtig button missing');
console.log('✓ Hören modernization verified.');

// 5. Sprachbausteine Teil 1
console.log('5. Checking Sprachbausteine Teil 1 modernization...');
assert(mockHtml.includes('mock-spb-container'), 'Spb container missing');
assert(mockHtml.includes('mock-inline-gap-select'), 'Inline gap select missing');
assert(mockHtml.includes('mock-spb-card'), 'Spb 1 card missing');
assert(mockHtml.includes('mock-spb-option-btn'), 'Spb option button missing');
assert(mockHtml.includes('renderMockSpb1'), 'renderMockSpb1 missing');
console.log('✓ Sprachbausteine Teil 1 modernization verified.');

// 6. Sprachbausteine Teil 2
console.log('6. Checking Sprachbausteine Teil 2 modernization...');
assert(mockHtml.includes('mock-wordbank-grid'), 'Word bank grid missing');
assert(mockHtml.includes('mock-word-card'), 'Word card missing');
assert(mockHtml.includes('mock-word-check'), 'Word checkmark missing');
assert(mockHtml.includes('renderMockSpb2'), 'renderMockSpb2 missing');
console.log('✓ Sprachbausteine Teil 2 modernization verified.');

// 7. Schreiben Workspace
console.log('7. Checking Schreiben modernization...');
assert(mockHtml.includes('mock-writing-situation'), 'Schreiben situation box missing');
assert(mockHtml.includes('mock-writing-char-btn'), 'Special char buttons missing');
assert(mockHtml.includes('id="writingAnswer"'), 'Writing textarea missing');
assert(mockHtml.includes('id="writingWords"'), 'Writing words counter missing');
assert(mockHtml.includes('renderWriting'), 'renderWriting missing');
console.log('✓ Schreiben modernization verified.');

// 8. Color tokens
console.log('8. Checking CSS color tokens (zero legacy green)...');
assert(!mockHtml.includes('#2d9b68'), 'Legacy #2d9b68 found!');
assert(!mockHtml.includes('var(--green)'), 'Legacy var(--green) found!');
assert(!mockHtml.includes('var(--green-soft)'), 'Legacy var(--green-soft) found!');
assert(!mockHtml.includes('var(--green-dark)'), 'Legacy var(--green-dark) found!');
console.log('✓ Zero legacy green found.');

// 9. Flat vs Elevated hierarchy in CSS
console.log('9. Checking Flat reading vs Elevated question card CSS hierarchy...');
assert(mockHtml.includes('.mock-reading-panel {'), 'mock-reading-panel CSS missing');
assert(mockHtml.includes('.lesen3-ad-card {'), 'lesen3-ad-card CSS missing');
assert(mockHtml.includes('.mock-item {'), 'mock-item CSS missing');
assert(mockHtml.includes('.mock-word-card {'), 'mock-word-card CSS missing');
console.log('✓ Flat vs elevated hierarchy verified.');

console.log('\n========================================================================');
console.log('  ALL 9/9 PHASE 7C WORKSPACE MODERNIZATION CHECKS PASSED!               ');
console.log('========================================================================\n');
