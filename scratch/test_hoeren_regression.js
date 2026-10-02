const fs = require('fs');
const assert = require('assert');

console.log('=== Running Phase 6D Comprehensive Regression Test Suite ===\n');

const html = fs.readFileSync('public/exercise.html', 'utf8');
const css = fs.readFileSync('public/assets/app.css', 'utf8');

// 1. Audio player controls and data attributes
console.log('1. Checking audio player markup and hooks...');
assert(html.includes('data-hoeren-player'), 'exercise.html must include data-hoeren-player');
assert(html.includes('data-audio-play'), 'exercise.html must include data-audio-play');
assert(html.includes('data-audio-skip="-5"'), 'exercise.html must include data-audio-skip="-5"');
assert(html.includes('data-audio-skip="5"'), 'exercise.html must include data-audio-skip="5"');
assert(html.includes('data-audio-progress'), 'exercise.html must include data-audio-progress');
assert(html.includes('data-audio-current'), 'exercise.html must include data-audio-current');
assert(html.includes('data-audio-duration'), 'exercise.html must include data-audio-duration');
assert(html.includes('data-audio-speed'), 'exercise.html must include data-audio-speed');
assert(html.includes('data-audio-mute'), 'exercise.html must include data-audio-mute');
assert(html.includes('data-audio-volume'), 'exercise.html must include data-audio-volume');
assert(html.includes('hoeren-audio-player-card is-unavailable'), 'exercise.html must support is-unavailable state');
console.log('✓ Audio player controls confirmed.\n');

// 2. Audio player logic in bindHoerenAudioPlayer
console.log('2. Checking bindHoerenAudioPlayer logic...');
assert(html.includes('function bindHoerenAudioPlayer()'), 'exercise.html must define bindHoerenAudioPlayer');
assert(html.includes("audio.addEventListener('error', markUnavailable"), 'Error listener must mark audio unavailable');
assert(html.includes('formatAudioTime(audio.currentTime)'), 'currentTime formatted correctly');
assert(html.includes('audio.playbackRate = rate;'), 'Playback rate switching intact');
console.log('✓ Audio player binding logic confirmed.\n');

// 3. Teil 1 True/False structure
console.log('3. Checking Hören Teil 1 True/False table & cards...');
assert(html.includes('function renderTF()'), 'exercise.html must define renderTF');
assert(html.includes('hoeren-table-card'), 'exercise.html must render hoeren-table-card');
assert(html.includes('hoeren-table-head'), 'exercise.html must render hoeren-table-head');
assert(html.includes('hoeren-table-row'), 'exercise.html must render hoeren-table-row');
assert(html.includes('hoeren-circle-radio-btn'), 'exercise.html must render hoeren-circle-radio-btn');
assert(html.includes('hoeren-circle-radio-label'), 'exercise.html must include hoeren-circle-radio-label for mobile clarity');
assert(html.includes('hoeren-tf-correct-hint'), 'exercise.html must render hoeren-tf-correct-hint');
console.log('✓ Hören Teil 1 True/False confirmed.\n');

// 4. Teil 2 Multiple Choice structure
console.log('4. Checking Hören Teil 2 Multiple Choice cards...');
assert(html.includes('function renderHoerenChoiceQuestions()'), 'exercise.html must define renderHoerenChoiceQuestions');
assert(html.includes('hoeren-choice-card'), 'exercise.html must render hoeren-choice-card');
assert(html.includes('hoeren-choice-question-row'), 'exercise.html must render hoeren-choice-question-row');
assert(html.includes('hoeren-choice-radio'), 'exercise.html must render hoeren-choice-radio');
assert(html.includes('hoeren-choice-option'), 'exercise.html must render hoeren-choice-option');
assert(html.includes('hoeren-choice-correct-hint'), 'exercise.html must render hoeren-choice-correct-hint');
assert(html.includes('bindActions()'), 'renderHoerenChoiceQuestions must call bindActions');
console.log('✓ Hören Teil 2 Multiple Choice confirmed.\n');

// 5. Teil 3 Matching / Selection
console.log('5. Checking Hören Teil 3 handling...');
assert(html.includes("model.exercise.section==='Hören'&&model.exercise.teil==='Teil 3'?{title:'AUSSAGEN'"), 'Hören Teil 3 matching title metadata intact');
assert(html.includes('if(model?.exercise?.audio_url) bindHoerenAudioPlayer();'), 'renderMatching binds audio player when present');
console.log('✓ Hören Teil 3 handling confirmed.\n');

// 6. Router logic in renderWorkspace
console.log('6. Checking Hören routing in renderWorkspace...');
assert(html.includes("model.exercise.section==='Hören'"), 'renderWorkspace must route Hören exercises');
assert(html.includes("model.exercise.teil==='Teil 2' && !isHoerenTF"), 'Teil 2 routes to choice questions when not TF');
console.log('✓ Hören routing confirmed.\n');

// 7. Audio Player LTR Enforcement in CSS
console.log('7. Checking LTR enforcement in app.css...');
assert(css.includes('.hoeren-audio-player-card') && css.includes('direction: ltr !important'), 'Audio player must be strictly LTR');
assert(css.includes('[dir="rtl"] .hoeren-audio-player-card'), 'RTL override rule present in app.css');
console.log('✓ LTR enforcement confirmed.\n');

// 8. Mobile responsive rules in app.css
console.log('8. Checking responsive media queries in app.css...');
assert(css.includes('@media (max-width: 700px)'), 'app.css must define mobile rules for <= 700px');
assert(css.includes('@media (max-width: 360px)'), 'app.css must define mobile rules for <= 360px');
assert(css.includes('grid-template-areas:'), 'app.css uses CSS grid for 2-row mobile audio player');
console.log('✓ Responsive rules confirmed.\n');

// 9. Core functions intact
console.log('9. Checking core exercise functions intact...');
assert(html.includes('async function submit('), 'submit() intact');
assert(html.includes('function buildSubmissionAnswers('), 'buildSubmissionAnswers() intact');
assert(html.includes("api('exercise-submit'"), 'exercise-submit API call intact');
assert(html.includes('function renderResult('), 'renderResult() intact');
assert(html.includes('function selectAnswer('), 'selectAnswer() intact');
assert(html.includes('id="checkBtn"'), '#checkBtn intact');
assert(html.includes('id="modelBtn"'), '#modelBtn intact');
assert(html.includes('id="exerciseBack"'), '#exerciseBack intact');
assert(html.includes('data-translate'), 'data-translate intact');
assert(html.includes('data-speak'), 'data-speak intact');
console.log('✓ Core exercise functions confirmed.\n');

// 10. Non-Hören sections preserved
console.log('10. Checking non-Hören sections untouched...');
assert(html.includes('function renderMatching()'), 'renderMatching() intact');
assert(html.includes('function renderChoiceQuestions()'), 'renderChoiceQuestions() intact');
assert(html.includes('function renderSprachbausteine1()'), 'renderSprachbausteine1() intact');
assert(html.includes('function renderWriting()'), 'renderWriting() intact');
assert(html.includes('function renderSpeaking()'), 'renderSpeaking() intact');
assert(css.includes('16. LESEN WORKSPACE MODERNIZATION (PHASE 6C)'), 'Phase 6C CSS intact');
console.log('✓ Non-Hören sections preserved.\n');

console.log('========================================================================');
console.log('  ALL 10/10 PHASE 6D VERIFICATION CHECKS PASSED!                       ');
console.log('========================================================================');
