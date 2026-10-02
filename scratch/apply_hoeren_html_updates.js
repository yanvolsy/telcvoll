const fs = require('fs');

let html = fs.readFileSync('public/exercise.html', 'utf8');

// 1. In renderMatching: bind audio player if audio_url exists
const target1 = ' bindTextTools();\n}\nfunction renderSprachbausteine1(){';
const repl1 = ' bindTextTools();\n if(model?.exercise?.audio_url) bindHoerenAudioPlayer();\n}\nfunction renderSprachbausteine1(){';
if (!html.includes(target1)) {
  console.error('Target 1 not found');
  process.exit(1);
}
html = html.replace(target1, repl1);

// 2. In renderHoerenChoiceQuestions: show option letter in radio indicator & bindActions
const target2 = '<span class="hoeren-choice-radio"></span>';
const repl2 = '<span class="hoeren-choice-radio">${esc(o.option_key.toUpperCase())}</span>';
if (!html.includes(target2)) {
  console.error('Target 2 not found');
  process.exit(1);
}
html = html.replace(target2, repl2);

const target3 = ' bindHoerenAudioPlayer();\n}\n\nfunction renderChoiceQuestions(){';
const repl3 = ' bindHoerenAudioPlayer();\n bindActions();\n}\n\nfunction renderChoiceQuestions(){';
if (!html.includes(target3)) {
  console.error('Target 3 not found');
  process.exit(1);
}
html = html.replace(target3, repl3);

// 3. In renderTF: add circle radio label
const targetR = '<span class="hoeren-circle-radio"></span>\n          </button>\n        </div>\n        <div class="hoeren-cell hoeren-cell-f">';
const replR = '<span class="hoeren-circle-radio" aria-hidden="true"></span>\n            <span class="hoeren-circle-radio-label">${text(\'صحيح\',\'Richtig\')}</span>\n          </button>\n        </div>\n        <div class="hoeren-cell hoeren-cell-f">';
if (!html.includes(targetR)) {
  console.error('Target R not found');
  process.exit(1);
}
html = html.replace(targetR, replR);

const targetF = '<button type="button" class="hoeren-circle-radio-btn ${fClass}" data-q="${it.position_no}" data-o="Falsch" aria-label="${dispNo} ${text(\'خطأ\',\'Falsch\')}" title="${text(\'خطأ\',\'Falsch\')}">\n            <span class="hoeren-circle-radio"></span>\n          </button>';
const replF = '<button type="button" class="hoeren-circle-radio-btn ${fClass}" data-q="${it.position_no}" data-o="Falsch" aria-label="${dispNo} ${text(\'خطأ\',\'Falsch\')}" title="${text(\'خطأ\',\'Falsch\')}">\n            <span class="hoeren-circle-radio" aria-hidden="true"></span>\n            <span class="hoeren-circle-radio-label">${text(\'خطأ\',\'Falsch\')}</span>\n          </button>';
if (!html.includes(targetF)) {
  console.error('Target F not found');
  process.exit(1);
}
html = html.replace(targetF, replF);

// 4. In renderWorkspace: route Hören
const targetDispatch = '  // Hören always uses the dedicated TELC True/False layout: audio above the questions,\n  // RICHTIG / FALSCH / AUSSAGE table in the middle, with the existing header and bottom actions unchanged.\n  if(model.exercise.section===\'Hören\')return renderTF();';
const replDispatch = '  // Hören routing: Teil 1 (TF), Teil 2 (Choice/MC), Teil 3 (Matching or TF)\n  if(model.exercise.section===\'Hören\'){\n    if(model.exercise.teil===\'Teil 2\' && !isHoerenTF) return renderHoerenChoiceQuestions();\n    if(model.exercise.teil===\'Teil 3\' && isMatching) return renderMatching();\n    if(isHoerenTF || model.exercise.teil===\'Teil 1\') return renderTF();\n    if(model.exercise.teil===\'Teil 2\') return renderHoerenChoiceQuestions();\n    return renderTF();\n  }';
if (!html.includes(targetDispatch)) {
  console.error('Target Dispatch not found');
  process.exit(1);
}
html = html.replace(targetDispatch, replDispatch);

fs.writeFileSync('public/exercise.html', html, 'utf8');
console.log('Successfully updated public/exercise.html!');
