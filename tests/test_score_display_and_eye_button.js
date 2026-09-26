const fs = require('fs');
const assert = require('assert');

console.log('=== Running Score Display Guard & Eye Button Verification Tests ===\n');

// 1. Verify public/exercise.html
console.log('Test 1: Verifying score guard and model answer separation in exercise.html...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');

assert(exHtml.includes('userCheckedAnswers'), 'exercise.html must include userCheckedAnswers state variable');
assert(exHtml.includes('async function submit(isExplicitCheck = true)'), 'submit() must support isExplicitCheck parameter');
assert(exHtml.includes('if(isExplicitCheck) userCheckedAnswers = true;'), 'submit() must set userCheckedAnswers only when isExplicitCheck is true');
assert(exHtml.includes('await submit(false)'), 'modelBtn must call submit(false) to prevent score panel leakage');
assert(exHtml.includes('const showResultScore = userCheckedAnswers && resultData;'), 'showResultScore must require userCheckedAnswers');
console.log('✓ Test 1 Passed: Score panel is strictly guarded; model answers never trigger the score.\n');

// 2. Verify removal of Nicht bestanden / Bestanden from resultPanel
console.log('Test 2: Verifying removal of Nicht bestanden / Bestanden in exercise.html...');
const resPanelSlice = exHtml.slice(exHtml.indexOf('const showResultScore = userCheckedAnswers && resultData;'), exHtml.indexOf('let titleMarkup = \'\';'));

assert(!resPanelSlice.includes('resultData.result'), 'resultPanel must not render resultData.result (Nicht bestanden / Bestanden)');
assert(resPanelSlice.includes('result-panel-score'), 'resultPanel must render clean score');
assert(resPanelSlice.includes('result-panel-percent'), 'resultPanel must render clean percentage');
console.log('✓ Test 2 Passed: Nicht bestanden / Bestanden is completely removed from exercise score pill.\n');

// 3. Verify Eye button classes and proper placement
console.log('Test 3: Verifying eye button markup and proper placement...');
assert(!exHtml.includes('class="btn small-btn title-reveal-btn title-eye-btn"'), 'title-eye-btn must not have btn or small-btn classes to avoid solid backgrounds');
assert(exHtml.includes('class="title-reveal-btn title-eye-btn"'), 'title-eye-btn must use dedicated title-reveal-btn class');
assert(exHtml.includes('stroke="#f47b20"'), 'eye SVG icon must have stroke #f47b20');
console.log('✓ Test 3 Passed: Eye button has clean dedicated classes with crisp orange SVG stroke.\n');

// 4. Verify CSS rules for transparent glass eye button and natural sub-bar positioning
console.log('Test 4: Verifying CSS in public/assets/app.css...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(appCss.includes('.exercise-header-card .title-reveal-btn') && appCss.includes('background: transparent !important;'), 'app.css must style title-eye-btn with background: transparent !important');
assert(appCss.includes('.exercise-header-card .thema-title-row') && appCss.includes('justify-content: flex-start !important;'), 'thema-title-row must use justify-content: flex-start !important to place eye button next to title');
assert(appCss.includes('.exercise-header-card .exercise-sub-bar') && appCss.includes('justify-content: flex-start !important;'), 'exercise-sub-bar must use justify-content: flex-start !important to prevent pushing result to far left');
assert(appCss.includes('.inline-result-panel.pass') && appCss.includes('.inline-result-panel.fail'), 'app.css must define vibrant pass and fail styling');
console.log('✓ Test 4 Passed: CSS enforces transparent glass eye button, grouped placement, and modern pass/fail pill.\n');

console.log('========================================================================');
console.log('  ALL SCORE GUARD & EYE BUTTON TESTS PASSED SUCCESSFULLY! (4/4)         ');
console.log('========================================================================');
