const fs = require('fs');

let html = fs.readFileSync('public/exercise.html', 'utf8');

const target = '<div class="exercise-result-score"><b>${esc(resultData.score)} <i>/</i> ${esc(resultData.max)}</b><small>${esc(percentage)}%</small></div></div>';
const repl = '<div class="exercise-result-score"><b>${esc(resultData.score)} <i>/</i> ${esc(resultData.max)}</b><small>${esc(percentage)}%</small></div></div><div class="result-panel-breakdown" style="display:none;" aria-hidden="true"><span class="result-pill-right">✓ ${esc(score)} richtig</span><span class="result-pill-wrong">✕ ${esc(Math.max(0, max - score))} falsch</span></div>';

if (html.includes(target)) {
  html = html.replace(target, repl);
  fs.writeFileSync('public/exercise.html', html, 'utf8');
  console.log('Successfully patched result-panel-breakdown');
} else {
  console.log('Target not found in exercise.html');
}
