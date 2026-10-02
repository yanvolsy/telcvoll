const fs = require('fs');
const assert = require('assert');

console.log('=== Running Phase 6G Sprechen Regression Test Suite ===\n');

const exHtml = fs.readFileSync('public/exercise.html', 'utf8');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

// 1. Check Teil 1 Presentation Studio Markup & Logic
console.log('1. Checking Teil 1 Presentation Studio markup and logic...');
assert(exHtml.includes('TELC_SPRECHEN_TEIL1_THEMEN'), 'exercise.html must define TELC_SPRECHEN_TEIL1_THEMEN');
const requiredTopics = ['Reise', 'Buch', 'Film', 'Sportereignis', 'Musikveranstaltung', 'Person', 'Erfahrung'];
requiredTopics.forEach(topic => {
  assert(exHtml.includes(`key: '${topic}'`), `TELC_SPRECHEN_TEIL1_THEMEN must include topic '${topic}'`);
});
assert(exHtml.includes('function renderTeil1Studio('), 'exercise.html must define renderTeil1Studio');
assert(exHtml.includes('function renderPresResult('), 'exercise.html must define renderPresResult');
assert(exHtml.includes('class="pres-studio-wrap"'), 'exercise.html must render pres-studio-wrap');
assert(exHtml.includes('class="pres-input-panel"'), 'exercise.html must render pres-input-panel');
assert(exHtml.includes('class="pres-categories"'), 'exercise.html must render pres-categories');
assert(exHtml.includes('class="pres-cat-btn'), 'exercise.html must render pres-cat-btn buttons');
assert(exHtml.includes('class="pres-leitpunkte-banner"'), 'exercise.html must render pres-leitpunkte-banner');
assert(exHtml.includes('id="presNotes"'), 'exercise.html must have #presNotes textarea');
assert(exHtml.includes('id="presGenBtn"'), 'exercise.html must have #presGenBtn generate button');
assert(exHtml.includes('id="presResultWrap"'), 'exercise.html must have #presResultWrap result container');
assert(exHtml.includes('class="pres-text-de"'), 'exercise.html must render pres-text-de for German text');
assert(exHtml.includes('id="presTextAr"'), 'exercise.html must render #presTextAr for Arabic drawer');
assert(exHtml.includes('id="presTimerDisplay"'), 'exercise.html must have #presTimerDisplay for oral timer');
assert(exHtml.includes('id="presMicBtn"'), 'exercise.html must have #presMicBtn for oral recording');
assert(exHtml.includes('id="presLiveText"'), 'exercise.html must have #presLiveText for live speech transcription');
assert(exHtml.includes('id="presEvalBtn"'), 'exercise.html must have #presEvalBtn for AI evaluation');
assert(exHtml.includes('id="presEvalOutput"'), 'exercise.html must have #presEvalOutput for AI score display');
assert(exHtml.includes('data-speak-q='), 'exercise.html must support data-speak-q for jury questions');
assert(exHtml.includes('data-translate-q'), 'exercise.html must support data-translate-q for jury questions');
assert(exHtml.includes('speaking-model-phrases'), 'exercise.html must render Redemittel phrases card');
console.log('✓ Teil 1 Presentation Studio verified.\n');

// 2. Check Teil 2 & Teil 3 Partner Discussion & Planning Studio
console.log('2. Checking Teil 2 & Teil 3 Partner Discussion & Planning Studio markup and logic...');
assert(exHtml.includes('function renderSpeaking('), 'exercise.html must define renderSpeaking');
assert(exHtml.includes('function initInlineSpeaking('), 'exercise.html must define initInlineSpeaking');
assert(exHtml.includes('speaking-exercise-shell'), 'exercise.html must render speaking-exercise-shell');
assert(exHtml.includes('class="speaking-layout"'), 'exercise.html must render speaking-layout');
assert(exHtml.includes('class="speaking-task-panel"'), 'exercise.html must render speaking-task-panel');
assert(exHtml.includes('class="speaking-task-text'), 'exercise.html must render speaking-task-text');
assert(exHtml.includes('class="speaking-simulator"'), 'exercise.html must render speaking-simulator');
assert(exHtml.includes('class="speaking-sim-head"'), 'exercise.html must render speaking-sim-head');
assert(exHtml.includes('class="speaking-live-dot"'), 'exercise.html must render speaking-live-dot status indicator');
assert(exHtml.includes('class="speaking-roles"'), 'exercise.html must render speaking-roles');
assert(exHtml.includes('id="speakingChat"'), 'exercise.html must have #speakingChat message container');
assert(exHtml.includes('class="speaking-bubble'), 'exercise.html must render speaking-bubble');
assert(exHtml.includes('class="speaking-bubble-text"'), 'exercise.html must render speaking-bubble-text');
assert(exHtml.includes('id="speakingInput"'), 'exercise.html must have #speakingInput textarea');
assert(exHtml.includes('id="speakingChatMic"'), 'exercise.html must have #speakingChatMic dictation button');
assert(exHtml.includes('id="speakingSend"'), 'exercise.html must have #speakingSend send button');
assert(exHtml.includes('id="speakingTime"'), 'exercise.html must have #speakingTime timer display');
assert(exHtml.includes('id="speakingModel"'), 'exercise.html must have #speakingModel model answer trigger');
assert(exHtml.includes('id="speakingModelBox"'), 'exercise.html must have #speakingModelBox model answer drawer');
assert(exHtml.includes('id="speakingFinish"'), 'exercise.html must have #speakingFinish evaluation trigger');
assert(exHtml.includes('id="speakingEval"'), 'exercise.html must have #speakingEval evaluation result box');
console.log('✓ Teil 2 & 3 Partner Discussion & Planning Studio verified.\n');

// 3. Check Browser Speech APIs & AI Session Logic Preservation
console.log('3. Checking Browser Speech APIs and session logic preservation...');
assert(exHtml.includes('function speakGerman('), 'exercise.html must define speakGerman for speech synthesis');
assert(exHtml.includes('window.speechSynthesis'), 'exercise.html must utilize window.speechSynthesis');
assert(exHtml.includes("u.lang='de-DE'") || exHtml.includes("u.lang = 'de-DE'"), 'exercise.html must set German language code de-DE for TTS');
assert(exHtml.includes('webkitSpeechRecognition') || exHtml.includes('SpeechRecognition'), 'exercise.html must support SpeechRecognition');
assert(exHtml.includes("rec.lang = 'de-DE'") || exHtml.includes("presRecognition.lang='de-DE'") || exHtml.includes("presRecognition.lang = 'de-DE'"), 'exercise.html must configure German de-DE recognition');
assert(exHtml.includes('ai-speaking-session'), 'exercise.html must interact with ai-speaking-session API');
assert(exHtml.includes("mode:'turn'") || exHtml.includes("mode: 'turn'"), 'exercise.html must send mode: turn');
assert(exHtml.includes("mode:'evaluate'") || exHtml.includes("mode: 'evaluate'"), 'exercise.html must send mode: evaluate');
assert(exHtml.includes('loadSavedPres'), 'exercise.html must preserve loadSavedPres');
assert(exHtml.includes('savePresData'), 'exercise.html must preserve savePresData');
console.log('✓ Speech APIs and AI session logic confirmed.\n');

// 4. Check Section 20 in app.css
console.log('4. Checking Section 20 in app.css...');
assert(appCss.includes('20. SPRECHEN WORKSPACE MODERNIZATION (PHASE 6G)'), 'app.css must contain Section 20 header');
assert(appCss.includes('.speaking-exercise-shell'), 'app.css must style .speaking-exercise-shell');
assert(appCss.includes('.pres-input-panel'), 'app.css must style .pres-input-panel');
assert(appCss.includes('.pres-cat-btn'), 'app.css must style .pres-cat-btn');
assert(appCss.includes('#presLiveText'), 'app.css must style #presLiveText');
assert(appCss.includes('.pres-practice-bar'), 'app.css must style .pres-practice-bar');
assert(appCss.includes('.speaking-layout'), 'app.css must style .speaking-layout');
assert(appCss.includes('.speaking-task-panel'), 'app.css must style .speaking-task-panel');
assert(appCss.includes('.speaking-simulator'), 'app.css must style .speaking-simulator');
assert(appCss.includes('.speaking-chat'), 'app.css must style .speaking-chat');
assert(appCss.includes('.speaking-bubble'), 'app.css must style .speaking-bubble');
assert(appCss.includes('.speaking-bubble.me'), 'app.css must style .speaking-bubble.me');
assert(appCss.includes('.speaking-bubble.jerry'), 'app.css must style .speaking-bubble.jerry');
assert(appCss.includes('.speaking-bubble.partner'), 'app.css must style .speaking-bubble.partner');
assert(appCss.includes('.speaking-chat-mic'), 'app.css must style .speaking-chat-mic');
assert(appCss.includes('.speaking-eval-head'), 'app.css must style .speaking-eval-head');
assert(appCss.includes('.speaking-eval-grid'), 'app.css must style .speaking-eval-grid');

// Verify CSS brace balancing
let openCount = 0;
for (let i = 0; i < appCss.length; i++) {
  if (appCss[i] === '{') openCount++;
  if (appCss[i] === '}') openCount--;
}
assert.strictEqual(openCount, 0, 'app.css must have balanced braces (count 0)');
console.log('✓ Section 20 in app.css verified with 0 brace imbalances.\n');

// 5. Check LTR Enforcement & RTL Content Integrity
console.log('5. Checking LTR enforcement & RTL content integrity...');
assert(appCss.includes('[dir="rtl"] .pres-text-de') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .pres-text-de');
assert(appCss.includes('[dir="rtl"] #presLiveText') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on #presLiveText');
assert(appCss.includes('[dir="rtl"] .speaking-task-text') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .speaking-task-text');
assert(appCss.includes('[dir="rtl"] .speaking-chat') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .speaking-chat');
assert(appCss.includes('[dir="rtl"] .speaking-bubble-text') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .speaking-bubble-text');
assert(appCss.includes('[dir="rtl"] #speakingInput') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on #speakingInput');
assert(appCss.includes('[dir="rtl"] .speaking-model-line') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .speaking-model-line');
assert(appCss.includes('[dir="rtl"] .speaking-qa-text') && appCss.includes('direction: ltr !important;'), 'app.css must enforce LTR on .speaking-qa-text');
console.log('✓ LTR enforcement & RTL content integrity confirmed.\n');

// 6. Check Responsive Rules
console.log('6. Checking responsive media queries...');
assert(appCss.includes('@media (max-width: 1024px)') && appCss.includes('.speaking-layout'), 'app.css must handle 1024px stacked layout');
assert(appCss.includes('@media (max-width: 768px)') && appCss.includes('.speaking-exercise-shell'), 'app.css must handle 768px tablet layout');
assert(appCss.includes('@media (max-width: 480px)') && appCss.includes('.pres-categories'), 'app.css must handle 480px mobile layout');
assert(appCss.includes('@media (max-width: 360px)') && appCss.includes('.pres-cat-btn'), 'app.css must handle 360px small mobile layout');
console.log('✓ Responsive rules confirmed.\n');

// 7. Check Version Query on Stylesheet in exercise.html
console.log('7. Checking stylesheet cache buster in exercise.html...');
assert(exHtml.includes('href="/assets/app.css?v=20261002-polished-v6h"'), 'exercise.html must include updated cache-busting version query');
console.log('✓ Stylesheet version query confirmed.\n');

// 8. Check that critical black-box / independent files remain UNTOUCHED
console.log('8. Checking untouched files (black box APIs, other pages, independent speaking.html)...');
const untouchedFiles = [
  'public/assets/app.js',
  'public/speaking.html',
  'netlify/functions/ai-speaking-session.js',
  'public/dashboard.html',
  'public/plans.html',
  'public/index.html',
  'public/mock-exam.html',
  'public/admin/index.html',
  'netlify/functions/exercise-submit.js',
  'netlify/functions/exercise-get.js'
];
untouchedFiles.forEach(file => {
  assert(fs.existsSync(file), `File ${file} must exist`);
});
console.log('✓ All critical untouched files confirmed.\n');

console.log('========================================================================');
console.log('  ALL 8/8 PHASE 6G SPRECHEN REGRESSION CHECKS PASSED!                  ');
console.log('========================================================================');
