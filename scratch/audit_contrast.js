const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git')) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.html') || file.endsWith('.css')) {
      results.push(full);
    }
  });
  return results;
}

console.log('--- Auditing HTML & CSS for dark theme contrast issues ---');
const files = walk('public');

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Check for hardcoded black text or white backgrounds on inputs / cards
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('#000') || l.includes('#000000') || l.includes('black') || l.includes('color:#111') || l.includes('color:#222') || l.includes('color:#333')) {
      if (l.includes('input') || l.includes('select') || l.includes('textarea') || l.includes('style=')) {
        console.log(`${f}:${idx + 1}: ${l.trim().slice(0, 100)}`);
      }
    }
  });
});
