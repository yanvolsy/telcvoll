const fs = require('fs');

let html = fs.readFileSync('public/exercise.html', 'utf8');

// 1. Bump cache version to v6e
const target1 = '<link rel="stylesheet" href="/assets/app.css?v=20261002-polished-v6d">';
const repl1 = '<link rel="stylesheet" href="/assets/app.css?v=20261002-polished-v6e">';
if (!html.includes(target1)) {
  console.error('Target 1 not found');
  process.exit(1);
}
html = html.replace(target1, repl1);

// 2. Pass spb2-workspace when gap2 is true
const target2 = "document.getElementById('content').innerHTML = layout(main, '', isLesen2 ? 'lesen2-workspace' : '');";
const repl2 = "document.getElementById('content').innerHTML = layout(main, '', isLesen2 ? 'lesen2-workspace' : gap2 ? 'spb2-workspace' : '');";
if (!html.includes(target2)) {
  console.error('Target 2 not found');
  process.exit(1);
}
html = html.replace(target2, repl2);

fs.writeFileSync('public/exercise.html', html, 'utf8');
console.log('Successfully updated public/exercise.html for Phase 6E!');
