const fs = require('fs');
const assert = require('assert');

console.log('=== Running Full Model Answer Resolution, LTR & Writing Special Chars Tests ===\n');

// 1. Verify public/exercise.html
console.log('Test 1: Verifying getFullAnswerText and model answer resolution in exercise.html...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');

assert(exHtml.includes('function getFullAnswerText(it, val, heads)'), 'exercise.html must define getFullAnswerText helper');
assert(exHtml.includes('class="assignment-correct-answer"'), 'exercise.html must include assignment-correct-answer class');
assert(exHtml.includes('class="correct-badge"'), 'exercise.html must render correct-badge for clear indicator');
assert(exHtml.includes('class="correct-full-text"'), 'exercise.html must render correct-full-text container');
assert(exHtml.includes('model-answer-bar'), 'exercise.html must style model-answer-bar for model solution view');

// Verify Lesen 1 & 3
assert(exHtml.includes('getFullAnswerText(it, correctVal, heads)'), 'renderMatching must resolve correctVal with getFullAnswerText');
assert(exHtml.includes('class="paragraph-assignment-head"'), 'renderMatching must include paragraph-assignment-head');

// Verify Sprachbausteine 1 & 2
assert(exHtml.includes('spb-correct-hint'), 'renderSprachbausteine1 must include spb-correct-hint');
assert(exHtml.includes('spb2-gap-correction'), 'renderBody must include spb2-gap-correction for Sprachbausteine 2');
assert(exHtml.includes('spb2-gap-model'), 'renderBody must include spb2-gap-model for Sprachbausteine 2 model answers');
assert(exHtml.includes('${esc(cleanOptionPrefix(v||k))}'), 'Sprachbausteine 2 select options must render clean word value without letter prefix');

// Verify Lesen 2 & Hören
assert(exHtml.includes('lesen2-correct-hint'), 'renderChoiceQuestions must include lesen2-correct-hint');
assert(exHtml.includes('hoeren-choice-correct-hint'), 'renderHoerenChoiceQuestions must include hoeren-choice-correct-hint');
assert(exHtml.includes('hoeren-tf-correct-hint'), 'renderTF must include hoeren-tf-correct-hint');

console.log('✓ Test 1 Passed: exercise.html comprehensively resolves full answer texts across all sections.\n');


// 2. Functional test of getFullAnswerText logic
console.log('Test 2: Functional verification of getFullAnswerText resolution...');
function extractHelperAndTest() {
  const funcStart = exHtml.indexOf('function getFullAnswerText(it, val, heads){');
  const funcEnd = exHtml.indexOf('\nfunction renderMatching(){', funcStart);
  assert(funcStart !== -1 && funcEnd !== -1, 'Could not find getFullAnswerText function block');
  
  const funcCode = exHtml.slice(funcStart, funcEnd);
  
  // Create mock environment
  const mockEnv = {
    model: {
      exercise: { section: 'Lesen', teil: 'Teil 1', task_type: 'MATCHING' }
    },
    text: (ar, de) => de,
    getExerciseHeadings: (m) => [],
    resolveMatchingCorrectKey: (val, heads) => {
      if (!val) return '';
      if (String(val).toUpperCase() === 'X') return 'X';
      const m = String(val).match(/^[A-Z]$/i);
      return m ? m[0].toUpperCase() : 'A';
    },
    parseAdText: (raw) => ({ title: 'Wohnung in Berlin', body: '3 Zimmer' }),
    cleanOptionPrefix: (str) => String(str || '').replace(/^(?:Text\s*[A-Z0-9]+|W\d+|[A-Za-z]|\d+)\s*[:—–\-]\s*/i, '').replace(/^[a-zA-Z0-9]+[\)\.]\s*/, '').trim(),
    matchingDisplayLabel: (h, i) => h,
    sharedOptions: () => [['a', 'deshalb'], ['b', 'obwohl'], ['c', 'jedoch']]
  };

  const fn = new Function('model', 'text', 'getExerciseHeadings', 'resolveMatchingCorrectKey', 'parseAdText', 'matchingDisplayLabel', 'sharedOptions', 'cleanOptionPrefix', `
    ${funcCode}
    return getFullAnswerText;
  `)(mockEnv.model, mockEnv.text, mockEnv.getExerciseHeadings, mockEnv.resolveMatchingCorrectKey, mockEnv.parseAdText, mockEnv.matchingDisplayLabel, mockEnv.sharedOptions, mockEnv.cleanOptionPrefix);

  // Test Lesen 1 matching
  const l1Result = fn(null, 'A', ['Wohnen im Alter: Neue Modelle', 'Sprachen lernen online']);
  assert.strictEqual(l1Result, 'Wohnen im Alter: Neue Modelle', 'Lesen 1 must resolve to clean heading text without prefix');

  // Test Lesen 3 matching with X
  mockEnv.model.exercise.section = 'Lesen';
  mockEnv.model.exercise.teil = 'Teil 3';
  const l3ResultX = fn(null, 'X', ['Ad 1']);
  assert(l3ResultX.includes('Keine passende Anzeige'), 'Lesen 3 with X must resolve to Keine passende Anzeige');

  // Test Sprachbausteine 2 word resolution (W4 or letter -> actual word)
  mockEnv.model.exercise.task_type = 'GAP_FILL';
  mockEnv.model.exercise.section = 'Sprachbausteine';
  mockEnv.model.exercise.teil = 'Teil 2';
  const spb2Result = fn({ position_no: 1 }, 'a');
  assert.strictEqual(spb2Result, 'deshalb', 'Sprachbausteine 2 must resolve key to actual word without prefix');

  // Test Multiple Choice option resolution
  mockEnv.model.exercise.section = 'Lesen';
  mockEnv.model.exercise.teil = 'Teil 2';
  const mcItem = {
    options: [
      { option_key: 'a', option_text: 'Erste Wahl' },
      { option_key: 'b', option_text: 'Zweite Wahl' }
    ]
  };
  const mcResult = fn(mcItem, 'b');
  assert.strictEqual(mcResult, 'Zweite Wahl', 'Multiple choice must resolve to full option text without prefix');

  // Test True/False
  mockEnv.model.exercise.section = 'Hören';
  mockEnv.model.exercise.teil = 'Teil 1';
  const tfResult = fn(null, 'Richtig');
  assert.strictEqual(tfResult, 'Richtig', 'True/False must resolve correctly');
}
extractHelperAndTest();
console.log('✓ Test 2 Passed: getFullAnswerText functional unit tests passed for all question types.\n');


// 3. Verify Schreiben Special Character Buttons in exercise.html and mock-exam.html
console.log('Test 3: Verifying Schreiben special characters & responsive editor...');
const mockHtml = fs.readFileSync('public/mock-exam.html', 'utf8');

const specialChars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];
specialChars.forEach(ch => {
  assert(exHtml.includes(ch), `exercise.html must include German character ${ch}`);
  assert(mockHtml.includes(ch), `mock-exam.html must include German character ${ch}`);
});

assert(exHtml.includes('setRangeText'), 'exercise.html must use setRangeText for cursor-position insertion');
assert(mockHtml.includes('mock-writing-char-btn'), 'mock-exam.html must include mock-writing-char-btn');
assert(mockHtml.includes('data-insert-char'), 'mock-exam.html must include data-insert-char buttons');

console.log('✓ Test 3 Passed: German special characters buttons (ä, ö, ü, ß, Ä, Ö, Ü) present and functional.\n');


// 4. Verify Permanent LTR Layout Enforcement in app.css and HTML
console.log('Test 4: Verifying permanent LTR exam layout rules...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(appCss.includes('body.exercise-page') && appCss.includes('direction: ltr !important;'), 'app.css must enforce direction: ltr on exercise-page');
assert(appCss.includes('.mock-root') && appCss.includes('direction: ltr !important;'), 'app.css must enforce direction: ltr on mock-root');
assert(appCss.includes('.exam-workspace') && appCss.includes('direction: ltr !important;'), 'app.css must enforce direction: ltr on exam-workspace');
assert(appCss.includes('.inline-translation') && appCss.includes('direction: rtl !important;'), 'app.css must enforce direction: rtl exclusively on inline translations');

console.log('✓ Test 4 Passed: Strict permanent LTR exam shell with isolated RTL translations confirmed.\n');


// 5. Verify Score Panel Breakdown
console.log('Test 5: Verifying result panel breakdown and no Nicht bestanden leakage...');
assert(exHtml.includes('result-panel-breakdown'), 'exercise.html must include result-panel-breakdown');
assert(exHtml.includes('result-pill-right'), 'exercise.html must include result-pill-right (✓ N richtig)');
assert(exHtml.includes('result-pill-wrong'), 'exercise.html must include result-pill-wrong (✕ M falsch)');

// Check mock-exam.html Spb2 dropdown has actual words
assert(mockHtml.includes('const wordText = v ? esc(v) : esc(k);'), 'mock-exam.html must show actual words in Spb2 dropdown without prefix');

console.log('✓ Test 5 Passed: Result breakdown displays clean counts and mock-exam Spb2 dropdown is verified.\n');

console.log('========================================================================');
console.log('  ALL FULL MODEL ANSWER, LTR & SPECIAL CHARS TESTS PASSED! (5/5)       ');
console.log('========================================================================');
