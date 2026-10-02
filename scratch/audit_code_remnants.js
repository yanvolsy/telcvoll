const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const patterns = [
  { term: 'activation code / كود التفعيل', re: /(?:activation[\s_-]?code|كود[\s_]التفعيل|رمز[\s_]التفعيل)/gi },
  { term: 'access code / كود الوصول', re: /(?:access[\s_-]?code|كود[\s_]الوصول|رمز[\s_]الوصول)/gi },
  { term: 'code generator / code-generator', re: /code[\s_-]?generator/gi },
  { term: 'activationCode', re: /activationCode/g },
  { term: 'accessCode', re: /accessCode/g },
  { term: 'generated code', re: /generated[\s_-]?code/gi },
  { term: 'redeem code / redeemCode', re: /(?:redeem[\s_-]?code|استرداد[\s_]الكود)/gi },
  { term: 'codes.html', re: /codes\.html/g },
  { term: 'code-generator.html', re: /code-generator\.html/g },
  { term: 'admin-codes', re: /admin-codes/g }
];

function scanDir(dir) {
  let results = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.git' || entry === '.gemini' || entry === 'scratch') continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (/\.(html|js|css|md|json)$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = scanDir(rootDir);
console.log(`Scanning ${allFiles.length} files across project for code-system remnants...\n`);

const occurrences = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  
  patterns.forEach(p => {
    let match;
    const regex = new RegExp(p.re.source, p.re.flags);
    while ((match = regex.exec(content)) !== null) {
      // Find line number
      const lineNum = content.substring(0, match.index).split('\n').length;
      const lineText = content.split('\n')[lineNum - 1].trim();
      occurrences.push({
        file: rel,
        line: lineNum,
        term: p.term,
        matched: match[0],
        context: lineText.substring(0, 140)
      });
    }
  });
});

console.log(`Found ${occurrences.length} occurrences.\n`);

// Group by file
const byFile = {};
occurrences.forEach(o => {
  byFile[o.file] = byFile[o.file] || [];
  byFile[o.file].push(o);
});

Object.keys(byFile).forEach(f => {
  console.log(`File: ${f} (${byFile[f].length} occurrences)`);
  byFile[f].slice(0, 5).forEach(o => {
    console.log(`  Line ${o.line} [${o.term}]: "${o.context}"`);
  });
  if (byFile[f].length > 5) {
    console.log(`  ... and ${byFile[f].length - 5} more occurrences.`);
  }
  console.log('');
});
