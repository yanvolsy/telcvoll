const fs = require('fs');

const css = fs.readFileSync('public/assets/app.css', 'utf8');

console.log('--- Checking input, select, textarea styles in app.css ---');
const inputRules = [];
const lines = css.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('select') || line.includes('input') || line.includes('textarea') || line.includes('paragraph-assignment') || line.includes('data-theme="dark"')) {
    if (line.length < 200) {
      inputRules.push({ line: idx + 1, text: line.trim() });
    } else {
      inputRules.push({ line: idx + 1, text: line.trim().slice(0, 150) + '...' });
    }
  }
});

console.log(`Found ${inputRules.length} matching lines.`);
inputRules.slice(0, 30).forEach(r => console.log(`${r.line}: ${r.text}`));
