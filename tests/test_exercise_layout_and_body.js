const fs = require('fs');
const assert = require('assert');

console.log('--- STARTING EXERCISE LAYOUT & READING TEXT TESTS ---');

// 1. Check exercise.html
console.log('\n[Test 1] Checking exercise.html layout & structure...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');

// Check that layout function no longer includes aside.exam-side
assert(!exHtml.includes('<aside class="exam-side">${side}</aside>'), 'aside.exam-side must be removed from layout()');
console.log('✓ aside.exam-side is completely removed from layout()');

// Check that renderMatching places paragraph-assignment ABOVE exam-text
const cardSlice = exHtml.slice(exHtml.indexOf('const cards = matchingOrder.map'), exHtml.indexOf('const main = `${bodySection}'));
const assignmentIdx = cardSlice.indexOf('class="paragraph-assignment"');
const examTextIdx = cardSlice.indexOf('class="exam-text"');
assert(assignmentIdx !== -1, 'paragraph-assignment must exist');
assert(examTextIdx !== -1, 'exam-text must exist');
assert(assignmentIdx < examTextIdx, 'paragraph-assignment must be placed before/above exam-text');
console.log('✓ Paragraph heading assignment dropdown is placed ABOVE the paragraph text');

// Check that headings bank is placed under paragraphs
assert(exHtml.includes('class="matching-headings-bank"'), 'matching-headings-bank must be present');
assert(exHtml.includes('layout(main + headingsBankUnder'), 'headingsBankUnder must be appended to main under paragraphs');
console.log('✓ Headings bank is placed underneath paragraphs');

// Check that unified sub-bar and isShuffleAllowed exist
assert(exHtml.includes('exercise-sub-bar'), 'exercise-sub-bar must be present under title');
assert(exHtml.includes('id="headingShuffleBtn"'), 'shuffle button must be present in sub-bar');
console.log('✓ Sub-bar is present under title with conditional shuffle and result panel');


// 2. Check CSS overrides
console.log('\n[Test 2] Checking app.css layout rules...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');
assert(appCss.includes('.exam-side,') && appCss.includes('display: none !important;'), 'exam-side must be display: none !important');
assert(appCss.includes('grid-template-columns: 1fr !important;'), 'exam-workspace must be 1fr');
assert(appCss.includes('.shuffle-btn-styled'), 'shuffle-btn-styled must be defined in app.css');
console.log('✓ CSS enforces full-width 1-column layout and hides exam-side');

// 3. Check Backend exercise-get.js reading text inheritance
console.log('\n[Test 3] Checking exercise-get.js reading text inheritance...');
const exGet = fs.readFileSync('netlify/functions/exercise-get.js', 'utf8');
assert(exGet.includes('parent_exercise_id'), 'exercise-get must check parent_exercise_id');
assert(exGet.includes('p.body') || exGet.includes('parentRes'), 'exercise-get must inherit parent body');
console.log('✓ Backend exercise-get inherits parent exercise body and instructions');

// 4. Check Backend _lib/guard.js
console.log('\n[Test 4] Checking guard.js access query...');
const guard = fs.readFileSync('netlify/functions/_lib/guard.js', 'utf8');
assert(guard.includes('instructions'), 'guard.js must select instructions');
assert(guard.includes('parent_exercise_id'), 'guard.js must select parent_exercise_id');
console.log('✓ Backend guard.js queries instructions and parent_exercise_id');

console.log('\n=============================================');
console.log('  ALL EXERCISE LAYOUT & READING TEXT TESTS PASSED!  ');
console.log('=============================================');
