const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const adminDir = path.join(rootDir, 'public', 'admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

console.log('=== Admin HTML Files Inventory ===\n');
const adminInventory = [];
files.forEach(f => {
  const p = path.join(adminDir, f);
  const stat = fs.statSync(p);
  const content = fs.readFileSync(p, 'utf8');
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'No title';
  
  // Extract API calls
  const apiCalls = Array.from(new Set((content.match(/api\(['"]([a-zA-Z0-9_\-\?&=]+)['"]/g) || [])
    .map(m => m.replace(/api\(['"]/, '').replace(/['"]$/, ''))));
  
  // Check for admin-guard.js
  const hasGuard = content.includes('admin-guard.js');
  
  // Check for admin navigation links inside <nav>
  const navMatches = Array.from(new Set(content.match(/href=["'](\/admin\/[^"']+)["']/g) || []))
    .map(m => m.replace(/href=["']/, '').replace(/["']$/, ''));

  adminInventory.push({
    file: 'admin/' + f,
    size: (stat.size / 1024).toFixed(1) + ' KB',
    title,
    hasGuard,
    apiCalls,
    navLinksCount: navMatches.length,
    navLinks: navMatches
  });

  console.log(`File: admin/${f} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`  Title: ${title}`);
  console.log(`  Has Guard: ${hasGuard}`);
  console.log(`  APIs: ${apiCalls.join(', ') || 'None'}`);
  console.log(`  Nav Links (${navMatches.length}): ${navMatches.join(', ')}\n`);
});

console.log('=== Admin Netlify Functions ===\n');
const fnDir = path.join(rootDir, 'netlify', 'functions');
const fnFiles = fs.readdirSync(fnDir).filter(f => f.startsWith('admin-') && f.endsWith('.js'));
fnFiles.forEach(f => {
  const p = path.join(fnDir, f);
  const stat = fs.statSync(p);
  console.log(`Function: netlify/functions/${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
