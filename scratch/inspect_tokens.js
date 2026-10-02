const fs = require('fs');
const css = fs.readFileSync('public/assets/app.css', 'utf8');

const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
if (rootMatch) {
  console.log('--- :root tokens (first 50 lines) ---');
  console.log(rootMatch[1].split('\n').slice(0, 50).join('\n'));
}

const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
if (darkMatch) {
  console.log('--- dark tokens (first 40 lines) ---');
  console.log(darkMatch[1].split('\n').slice(0, 40).join('\n'));
}
