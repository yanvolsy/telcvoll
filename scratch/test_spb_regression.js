const fs = require('fs');
const assert = require('assert');

console.log('=== Running Phase 6E Sprachbausteine Regression Test Suite ===\n');

const html = fs.readFileSync('public/exercise.html', 'utf8');
const css = fs.readFileSync('public/assets/app.css', 'utf8');

// 1. Sprachbausteine Teil 1 & Gaps 21-30
console.log('1. Checking Sprachbausteine Teil 1 and Lücken 21-30...');
assert(html.includes('function renderSprachbausteine1()'), 'exercise.html must define renderSprachbausteine1');
assert(html.includes('Number(n)+20'), 'Teil 1 must calculate exam gap numbers 21-30');
assert(html.includes('class="spb-questions-container"'), 'exercise.html must render spb-questions-container');
assert(html.includes('class="spb-questions-grid"'), 'exercise.html must render spb-questions-grid');
assert(html.includes('spb1-question'), 'exercise.html must render spb1-question cards');
assert(html.includes('spb-correct-hint'), 'exercise.html must render spb-correct-hint');
console.log('✓ Sprachbausteine Teil 1 confirmed.\n');

// 2. data-gap-select hook & inline selects
console.log('2. Checking data-gap-select hook & inline gap select...');
assert(html.includes('data-gap-select'), 'exercise.html must retain data-gap-select attribute');
assert(html.includes('class="inline-gap-select'), 'exercise.html must render inline-gap-select');
assert(html.includes("document.querySelectorAll('[data-gap-select]').forEach(sel=>sel.onchange"), 'Change listener on data-gap-select intact');
assert(css.includes('.inline-gap-select') && css.includes('appearance: none !important'), 'app.css must style inline-gap-select');
assert(css.includes('.inline-gap-select.answered'), 'app.css must style answered state');
assert(css.includes('.inline-gap-select.result-correct'), 'app.css must style correct state');
assert(css.includes('.inline-gap-select.result-wrong'), 'app.css must style wrong state');
console.log('✓ data-gap-select and styling confirmed.\n');

// 3. Sprachbausteine Teil 2 & Wortbank
console.log('3. Checking Sprachbausteine Teil 2 and Wortbank...');
assert(html.includes('Number(n)+30'), 'Teil 2 must calculate exam gap numbers 31-40');
assert(html.includes('spb2-gap-wrapper'), 'exercise.html must render spb2-gap-wrapper');
assert(html.includes('spb2-gap-correction'), 'exercise.html must render spb2-gap-correction');
assert(html.includes('spb2-gap-model'), 'exercise.html must render spb2-gap-model');
assert(html.includes('class="word-bank"'), 'exercise.html must render word-bank');
assert(html.includes('class="word-card'), 'exercise.html must render word-card');
assert(html.includes('data-word='), 'word cards must include data-word attribute');
assert(html.includes("Object.values(answers).includes(k)?'used':''"), 'word-card must track used state');
assert(css.includes('.word-card.used'), 'app.css must style used state for word cards');
assert(css.includes('.word-card.model-correct'), 'app.css must style model-correct state for word cards');
console.log('✓ Sprachbausteine Teil 2 and Wortbank confirmed.\n');

// 4. Word Bank interaction & unique options
console.log('4. Checking word bank click assignment & unique options...');
assert(html.includes("document.querySelectorAll('[data-word]').forEach(b=>b.onclick="), 'Clicking word card assigns to first unfilled gap');
assert(html.includes('refreshSpb2UniqueOptions'), 'Teil 2 unique options prevention intact');
console.log('✓ Word bank interaction confirmed.\n');

// 5. LTR enforcement for German text
console.log('5. Checking LTR enforcement for German content...');
assert(css.includes('[dir="rtl"] #spb1-text') && css.includes('direction: ltr !important'), 'spb1-text must remain LTR');
assert(css.includes('[dir="rtl"] #gap2-text') && css.includes('direction: ltr !important'), 'gap2-text must remain LTR');
assert(css.includes('[dir="rtl"] .word-bank') && css.includes('direction: ltr !important'), 'word-bank must remain LTR');
console.log('✓ LTR content integrity confirmed.\n');

// 6. Responsive breakpoints for mobile
console.log('6. Checking responsive breakpoints in app.css...');
assert(css.includes('@media (max-width: 768px)'), 'app.css defines rules for <= 768px');
assert(css.includes('@media (max-width: 430px)'), 'app.css defines rules for <= 430px');
assert(css.includes('@media (max-width: 360px)'), 'app.css defines rules for <= 360px');
console.log('✓ Responsive breakpoints confirmed.\n');

// 7. Non-Sprachbausteine sections preserved
console.log('7. Checking other exercise workspaces preserved...');
assert(html.includes('function renderMatching()'), 'renderMatching() intact (Lesen 1/3)');
assert(html.includes('function renderChoiceQuestions()'), 'renderChoiceQuestions() intact (Lesen 2)');
assert(html.includes('function renderTF()'), 'renderTF() intact (Hören 1)');
assert(html.includes('function renderHoerenChoiceQuestions()'), 'renderHoerenChoiceQuestions() intact (Hören 2)');
assert(html.includes('function renderWriting()'), 'renderWriting() intact (Schreiben)');
assert(html.includes('function renderSpeaking()'), 'renderSpeaking() intact (Sprechen)');
assert(css.includes('16. LESEN WORKSPACE MODERNIZATION (PHASE 6C)'), 'Phase 6C CSS intact');
assert(css.includes('17. HÖREN WORKSPACE MODERNIZATION (PHASE 6D)'), 'Phase 6D CSS intact');
console.log('✓ Non-Sprachbausteine sections preserved.\n');

console.log('========================================================================');
console.log('  ALL 7/7 SPRACHBAUSTEINE REGRESSION CHECKS PASSED!                    ');
console.log('========================================================================');
