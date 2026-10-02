const fs = require('fs');
const assert = require('assert');

console.log('=== Running Phase 7D Functional Result Scenarios Verification ===\n');

const resultHtml = fs.readFileSync('public/self-test-result.html', 'utf8');

// Extract JS script from self-test-result.html
const scriptMatch = resultHtml.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, 'Script block missing in self-test-result.html');
const scriptCode = scriptMatch[1];

// Create a DOM mockup to evaluate render() under multiple mock test results
function simulateResult(mockData, lang = 'ar') {
  let innerHtml = '';
  const domMock = {
    documentElement: {
      setAttribute: () => {},
      classList: { add: () => {} }
    },
    body: {
      setAttribute: () => {}
    },
    getElementById: (id) => {
      if (id === 'content') {
        return {
          set innerHTML(val) { innerHtml = val; },
          get innerHTML() { return innerHtml; }
        };
      }
      return null;
    },
    addEventListener: () => {}
  };

  const localStorageMock = {
    getItem: (key) => key === 'telc_mock_result' ? JSON.stringify(mockData) : null
  };

  const sandbox = {
    window: {
      addEventListener: () => {},
      print: () => {}
    },
    document: domMock,
    localStorage: localStorageMock,
    location: { href: '' },
    getLang: () => lang,
    esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    console
  };

  // Run the code in sandbox
  const runCode = new Function('window', 'document', 'localStorage', 'location', 'getLang', 'esc', scriptCode);
  runCode(sandbox.window, sandbox.document, sandbox.localStorage, sandbox.location, sandbox.getLang, sandbox.esc);

  return innerHtml;
}

// 1. Scenario A: Passed Exam (160 / 225)
console.log('1. Testing Scenario A: Passed Exam (160 / 225)...');
const passResult = {
  level: 'B2',
  sections: {
    Lesen: { score: 55, max: 75 },
    Sprachbausteine: { score: 20, max: 30 },
    Hören: { score: 55, max: 75 },
    Schreiben: { score: 30, max: 45 }
  },
  finishedAt: Date.now()
};
const passHtml = simulateResult(passResult, 'ar');
assert.ok(passHtml.includes('result-hero pass'), 'Pass state hero class missing');
assert.ok(passHtml.includes('🏆'), 'Pass trophy icon missing');
assert.ok(passHtml.includes('Befriedigend'), 'Prädikat Befriedigend missing for 160');
assert.ok(passHtml.includes('160,0'), 'Formatted total score 160,0 missing');
assert.ok(passHtml.includes('71.1%'), 'Percentage 71.1% missing');
assert.ok(passHtml.includes('var(--state-success'), 'var(--state-success) missing in pass state');
console.log('✓ Scenario A (Passed Exam) passed.');

// 2. Scenario B: Failed Exam (110 / 225)
console.log('2. Testing Scenario B: Failed Exam (110 / 225)...');
const failResult = {
  level: 'B2',
  sections: {
    Lesen: { score: 35, max: 75 },
    Sprachbausteine: { score: 15, max: 30 },
    Hören: { score: 40, max: 75 },
    Schreiben: { score: 20, max: 45 }
  },
  finishedAt: Date.now()
};
const failHtml = simulateResult(failResult, 'ar');
assert.ok(failHtml.includes('result-hero encourage'), 'Encourage state hero class missing');
assert.ok(failHtml.includes('💪'), 'Encourage arm icon missing');
assert.ok(failHtml.includes('Nicht bestanden'), 'Prädikat Nicht bestanden missing for 110');
assert.ok(failHtml.includes('110,0'), 'Formatted total score 110,0 missing');
assert.ok(failHtml.includes('48.9%'), 'Percentage 48.9% missing');
assert.ok(failHtml.includes('var(--state-danger'), 'var(--state-danger) missing in fail state');
console.log('✓ Scenario B (Failed Exam) passed.');

// 3. Scenario C: Writing AI Evaluation Criteria
console.log('3. Testing Scenario C: Writing AI Evaluation Criteria breakdown...');
const writingResult = {
  level: 'B2',
  sections: {
    Lesen: { score: 60, max: 75 },
    Sprachbausteine: { score: 25, max: 30 },
    Hören: { score: 65, max: 75 },
    Schreiben: { score: 35, max: 45 }
  },
  writing: {
    score: 35,
    max: 45,
    criteria: [
      { name: 'Inhaltliche Angemessenheit', score: 9, max: 10 },
      { name: 'Sprachliche Korrektheit', score: 8, max: 10 },
      { name: 'Ausdrucksfähigkeit', score: 9, max: 10 },
      { name: 'Textstruktur', score: 9, max: 15 }
    ]
  },
  finishedAt: Date.now()
};
const writingHtml = simulateResult(writingResult, 'de');
assert.ok(writingHtml.includes('subscores'), 'Subscores container missing');
assert.ok(writingHtml.includes('Inhaltliche Angemessenheit'), 'Criterion label missing');
assert.ok(writingHtml.includes('9,0 / 10'), 'Criterion score missing');
console.log('✓ Scenario C (Writing Criteria) passed.');

// 4. Scenario D: German Language Toggle
console.log('4. Testing Scenario D: German Language Output...');
const germanHtml = simulateResult(passResult, 'de');
assert.ok(germanHtml.includes('Gut gemacht.'), 'German pass text missing');
assert.ok(germanHtml.includes('Ergebnis der schriftlichen Prüfung'), 'German cert title missing');
assert.ok(germanHtml.includes('Prüfung wiederholen'), 'German repeat button missing');
console.log('✓ Scenario D (German Language Output) passed.');

console.log('\n========================================================================');
console.log('  ALL 4/4 FUNCTIONAL RESULT SCENARIOS VERIFIED SUCCESSFULLY!            ');
console.log('========================================================================\n');
