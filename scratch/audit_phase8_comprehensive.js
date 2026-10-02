const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('=== Starting Phase 8 Comprehensive Audit Script ===\n');

// 1. Gather all files
function getFiles(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full, exts));
    } else {
      if (!exts || exts.some(e => file.endsWith(e))) {
        results.push(full);
      }
    }
  });
  return results;
}

const htmlFiles = getFiles(path.join(rootDir, 'public'), ['.html']);
const jsFiles = getFiles(path.join(rootDir, 'public'), ['.js']);
const netlifyFnFiles = getFiles(path.join(rootDir, 'netlify', 'functions'), ['.js']);
const appCssPath = path.join(rootDir, 'public', 'assets', 'app.css');
const appCss = fs.readFileSync(appCssPath, 'utf8');

console.log(`Found ${htmlFiles.length} HTML files, ${jsFiles.length} public JS files, ${netlifyFnFiles.length} Netlify functions.`);

// 2. Legacy Green Audit across all public HTML and CSS
console.log('\n--- 1. Legacy Green Audit (#2d9b68, var(--green*)) ---');
const legacyPatterns = [
  { name: '#2d9b68', re: /#2d9b68/gi },
  { name: 'var(--green)', re: /var\(--green\b/g },
  { name: 'var(--green-soft)', re: /var\(--green-soft\b/g },
  { name: 'var(--green-dark)', re: /var\(--green-dark\b/g }
];

const legacyReport = [];
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  legacyPatterns.forEach(p => {
    const m = content.match(p.re);
    if (m) {
      legacyReport.push({ file: rel, pattern: p.name, count: m.length });
    }
  });
});

console.log('Legacy green occurrences in public HTML files:', legacyReport);

// Also check app.css
legacyPatterns.forEach(p => {
  const m = appCss.match(p.re);
  console.log(`app.css occurrences for ${p.name}:`, m ? m.length : 0);
});

// 3. Syntax Verification for all inline scripts in HTML files
console.log('\n--- 2. Inline JavaScript Syntax Verification ---');
const syntaxIssues = [];
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let idx = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    idx++;
    try {
      new Function(match[1]);
    } catch(e) {
      syntaxIssues.push({ file: rel, scriptIndex: idx, error: e.message });
    }
  }
});
if (syntaxIssues.length === 0) {
  console.log('✓ All inline scripts across all 36 HTML files parsed with ZERO syntax errors.');
} else {
  console.error('Syntax errors found:', syntaxIssues);
}

// 4. Security Sanity Check: Look for secret keys in public files
console.log('\n--- 3. Security Sanity Check in public/ ---');
const publicFiles = [...htmlFiles, ...jsFiles];
const suspiciousKeys = [
  { name: 'Supabase Service Role Key', re: /service_role/i },
  { name: 'Stripe Secret Key', re: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: 'OpenAI Secret Key', re: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'Private Key header', re: /-----BEGIN PRIVATE KEY-----/ }
];

const securityFindings = [];
publicFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  suspiciousKeys.forEach(k => {
    if (k.re.test(content)) {
      securityFindings.push({ file: rel, issue: k.name });
    }
  });
});
if (securityFindings.length === 0) {
  console.log('✓ No private/secret keys or service-role tokens found in public assets.');
} else {
  console.error('Security issues found:', securityFindings);
}

// 5. Navigation & Link Integrity Audit across primary user-facing pages
console.log('\n--- 4. Navigation & Route Link Integrity ---');
const coreUserPages = [
  'public/index.html',
  'public/plans.html',
  'public/dashboard.html',
  'public/exercise.html',
  'public/speaking.html',
  'public/self-test.html',
  'public/mock-exam.html',
  'public/self-test-result.html',
  'public/telc-chat.html',
  'public/profile.html',
  'public/login.html',
  'public/register.html'
];

const brokenLinks = [];
coreUserPages.forEach(p => {
  const filePath = path.join(rootDir, p);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const hrefRegex = /href=["'](\/[a-zA-Z0-9_\-\.\/]+(?:\?[^"']*)?)["']/g;
  let m;
  while ((m = hrefRegex.exec(content)) !== null) {
    const rawHref = m[1];
    const cleanPath = rawHref.split('?')[0].split('#')[0];
    if (cleanPath === '/' || cleanPath.startsWith('/#')) continue;
    const targetFile = path.join(rootDir, 'public', cleanPath === '/' ? 'index.html' : cleanPath.endsWith('.html') ? cleanPath : cleanPath + '.html');
    if (!fs.existsSync(targetFile) && !cleanPath.includes('/assets/') && !cleanPath.includes('/manifest')) {
      brokenLinks.push({ source: p, target: rawHref });
    }
  }
});
console.log('Broken navigation links count:', brokenLinks.length);
if (brokenLinks.length > 0) {
  console.log('Broken links details:', brokenLinks);
} else {
  console.log('✓ All internal links on core pages point to existing destinations.');
}

// 6. Viewport Meta tag check on all public pages
console.log('\n--- 5. Viewport Meta Tag Audit ---');
const missingViewport = [];
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file).replace(/\\/g, '/');
  if (!content.includes('name="viewport"')) {
    missingViewport.push(rel);
  }
});
console.log('Missing viewport meta tags:', missingViewport.length > 0 ? missingViewport : 'None (All have viewport meta)');

console.log('\n========================================================================');
console.log('  INITIAL AUDIT EXTRACTIONS COMPLETE                                    ');
console.log('========================================================================\n');
